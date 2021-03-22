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
        let url = `${nodecache.getValue('MAILCHIMP_BASE_URL')}/campaigns`;
        const response = await axios.get(url, { auth });
        const { campaigns } = response.data;
        const data = campaigns.map(campaign => {
            return {
                title: campaign.settings.title,
                previewText: campaign.settings.preview_text,
                subject: campaign.settings.subject_line,
                status: campaign.delivery_status.status,
                emailsSent: campaign.delivery_status.emails_sent,
                sendTime: campaign.send_time,
                campaign
            };
        });

        res.json(data);
    } catch (error) {
        logger.error(error);
    }
}

exports.getCampaigns = getCampaigns;
