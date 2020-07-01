/* eslint-disable prettier/prettier */
const request = require('supertest');

const HTTPMethods = ['get', 'post', 'put', 'delete'];

const PropTypes = {
    String: '_Response_Property_Type_String_',
    Number: '_Response_Property_Type_Number_',
    Object: '_Response_Property_Type_Object_',
    Array: '_Response_Property_Type_Array_'
}

const Test = (description, getApp) => {
    let _route;
    let _reqBody;
    let _status;
    let _cookie;
    let _resProps;
    let _schema;
    let _response
    let _queue = []
    let _headers = []

    const _getObjectType = obj => Object.prototype.toString.call(obj).slice(8).slice(0, -1);

    const _matchSchema = (body, schema) => {
        if (!schema) return true;

        const type = _getObjectType(body);
        const schemaType = _getObjectType(schema);

        if (['Undefined', 'Null'].includes(type)) {
          const { Boolean, String, Number } = PropTypes;
          if ([Boolean, String, Number].includes(schema)) return true;
          return false;
        }

        if (['Boolean', 'String', 'Number'].includes(type)) {
          if (schema === PropTypes[type] || schema === body) return true;
        }

        if (type === 'Object') {
          if (schema === PropTypes.Object) return true;
          if (type !== schemaType) return false;

          let valid = true;

          const properties = Object.keys(schema);
          if (properties.length === 0) return true;
          properties.forEach(prop => (valid = valid && (body.hasOwnProperty(prop) ? _matchSchema(body[prop], schema[prop]) : false)));

          return valid;
        }

        if (type === 'Array') {
          if (schema === PropTypes.Array) return true;
          if (schema.length === 0) return true;
          if (type !== schemaType) return false;

          let valid = true;
          body.forEach((prop, index) => { valid = valid && (schema.length === 1? _matchSchema(prop, schema[0]): _matchSchema(prop, schema[index]))});

          return valid;
        }

        return false;
      };

    const publicInterface = {
        route: route => {
            _route = route;
            return publicInterface;
        },
        data: reqBody => {
            _reqBody = reqBody;
            return publicInterface;
        },
        status: status => {
            _status = status;
            return publicInterface;
        },
        cookie: cookie => {
            if (cookie) {
                if(_getObjectType(cookie) !== 'Object') throw new Error('cookie(cookie) expects an object of key value pair as argument')
                _cookie = Object.keys(cookie).map(
                    key => `${key}=${cookie[key]}`
                );
            }
            return publicInterface;
        },
        haveProperties: function haveProperties(resProps) {
            if(!_response) {
                _resProps = resProps
                _queue.push(haveProperties)
            }
            else if(_resProps){
                if(!Array.isArray(_resProps)) throw new Error('haveProperties(resProps) expect an argument of type array')
                _resProps.forEach(prop => expect(_response.body).toHaveProperty(prop))
            }
            return publicInterface
        },
        validateBodySchema: function validateBodySchema(schema) {
            if(schema) _schema = schema
            if(!_response) _queue.push(validateBodySchema)
            else if(_schema) expect(_matchSchema(_response.body, _schema)).toBe(true)
            return publicInterface
        },
        isJSON: function isJSON() {
            if(!_response) _queue.push(isJSON)
            else expect(_response.res.headers['content-type']).toMatch('application/json');
            return publicInterface
        },
        header: function header(key, value) {
            _headers.push({key, value})
            return publicInterface
        }
    };

    HTTPMethods.forEach(method => {
        publicInterface[method] = (route, status, reqBody, responseProps) => {
            it(description, async () => {
                if (route) _route = route;
                if (reqBody) _reqBody = reqBody;
                if (status) _status = status;
                if (responseProps) _resProps = responseProps;

                let req = request(getApp())[method](_route)

                if(_reqBody) req.send(_reqBody);

                if(_headers.length) _headers.forEach(({key, value}) => req.set(key, value))

                if (_cookie) req = req.set('Cookie', _cookie);

                _response = await req;

                expect.hasAssertions()

                if(_status) expect(_response.statusCode).toBe(_status);

                _queue.forEach(f => f())
                _queue = []
            });
            return publicInterface;
        }
    })

    return publicInterface;
};

exports.Test = Test;
exports.PropTypes = PropTypes
