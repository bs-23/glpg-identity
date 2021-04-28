const path = require('path');
const axios = require('axios');

const logger = require(path.join(process.cwd(), 'src/config/server/lib/winston'));
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const auth = {
    username: 'any',
    password: nodecache.getValue('MAILCHIMP_API_KEY')
};

async function getCampaigns(req, res) {
    try {
        const page = req.query.page ? +req.query.page - 1 : 0;
        const limit = req.query.limit ? +req.query.limit : 15;
        const offset = page * limit;

        let url = `${nodecache.getValue('MAILCHIMP_BASE_URL')}/campaigns?sort_field=create_time&sort_dir=DESC&count=${limit}&offset=${offset}`;
        const response = await axios.get(url, { auth });

        const campaigns = response.data.campaigns.map(campaign => {
            return {
                id: campaign.id,
                title: campaign.settings.title,
                previewText: campaign.settings.preview_text,
                subject: campaign.settings.subject_line,
                status: campaign.status,
                type: campaign.type,
                emailsSent: campaign.delivery_status.emails_sent,
                sendTime: campaign.send_time,
                open_rate: campaign.report_summary.open_rate
            };
        });
        const total = response.data.total_items;
        const data = {
            campaigns,
            total,
            page: page + 1,
            limit,
            start: limit * page + 1,
            end: offset + limit > total ? total : offset + limit,
            ffff: response.data
        };
        res.json(data);
    } catch (error) {
        logger.error(error);
        res.status(500).send('Internal server error');
    }
}

exports.getCampaigns = getCampaigns;
