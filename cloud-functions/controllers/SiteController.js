const { Site } = require('../models');

async function getSiteInfo(req, res, next) {
    try {
        const siteInfo = await Site.findOne();
        if (!siteInfo) {
            return res.json({ code: -1, message: 'Site information not found' });
        }
        if(siteInfo.json) {
            siteInfo.json = JSON.parse(siteInfo.json);
            if (!siteInfo.json.logo) {
                siteInfo.json.logo = '/default-logo.png'; // Set a default logo URL if none is available
            }
        }
        else {
            siteInfo.json = { logo: '/default-logo.png' }; // Set a default logo URL if none is available
        }
        res.json({ code: 1, message: 'Site information retrieved successfully', data: siteInfo });
    } catch (error) {
        return res.status(404).json({ code: -1, message: error.message });
    }
}

module.exports = {
    getSiteInfo
}