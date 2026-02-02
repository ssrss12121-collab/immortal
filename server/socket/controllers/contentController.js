const Banner = require('../models/Banner');
const { News, MVP } = require('../models/News');
const cache = require('../scripts/cacheService');

// Banners
exports.getBanners = async (req, res) => {
    try {
        const cacheKey = 'banners_list';
        const cached = cache.get(cacheKey);
        if (cached) return res.json({ success: true, banners: cached, fromCache: true });

        const banners = await Banner.find().sort({ order: 1 }).lean();
        const formattedBanners = banners.map(banner => ({
            ...banner,
            id: banner._id.toString()
        }));

        cache.set(cacheKey, formattedBanners, 300); // 5 mins
        res.json({ success: true, banners: formattedBanners });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.addBanner = async (req, res) => {
    try {
        const banner = new Banner(req.body);
        await banner.save();
        cache.del('banners_list');
        res.status(201).json({ success: true, banner });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        cache.del('banners_list');
        res.json({ success: true, message: 'Banner deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
        cache.del('banners_list');
        res.json({ success: true, banner });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// News
exports.getNews = async (req, res) => {
    try {
        const cacheKey = 'news_list';
        const cached = cache.get(cacheKey);
        if (cached) return res.json({ success: true, news: cached, fromCache: true });

        const news = await News.find().sort({ createdAt: -1 }).limit(20).lean();
        const formattedNews = news.map(item => ({
            ...item,
            id: item._id.toString()
        }));

        cache.set(cacheKey, formattedNews, 60);
        res.json({ success: true, news: formattedNews });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.addNews = async (req, res) => {
    try {
        const newsItem = new News({
            ...req.body,
            date: new Date().toLocaleDateString()
        });
        await newsItem.save();
        cache.del('news_list');
        res.status(201).json({ success: true, news: newsItem });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteNews = async (req, res) => {
    try {
        await News.findByIdAndDelete(req.params.id);
        cache.del('news_list');
        res.json({ success: true, message: 'News deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateNews = async (req, res) => {
    try {
        const newsItem = await News.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
        cache.del('news_list');
        res.json({ success: true, news: newsItem });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// MVPs
exports.getMVPs = async (req, res) => {
    try {
        const cacheKey = 'mvps_list';
        const cached = cache.get(cacheKey);
        if (cached) return res.json({ success: true, mvps: cached, fromCache: true });

        const mvps = await MVP.find().sort({ createdAt: -1 }).limit(10).lean();
        const formattedMVPs = mvps.map(mvp => ({
            ...mvp,
            id: mvp._id.toString()
        }));

        cache.set(cacheKey, formattedMVPs, 300);
        res.json({ success: true, mvps: formattedMVPs });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
// ... other methods follow same pattern

exports.addMVP = async (req, res) => {
    try {
        const mvp = new MVP(req.body);
        await mvp.save();

        cache.del('mvps_list');

        // Map _id to id for frontend compatibility
        const formattedMVP = {
            ...mvp.toObject(),
            id: mvp._id.toString()
        };
        res.status(201).json({ success: true, mvp: formattedMVP });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteMVP = async (req, res) => {
    try {
        await MVP.findByIdAndDelete(req.params.id);
        cache.del('mvps_list');
        res.json({ success: true, message: 'MVP deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateMVP = async (req, res) => {
    try {
        const mvp = await MVP.findByIdAndUpdate(req.params.id, req.body, { new: true });
        cache.del('mvps_list');
        res.json({ success: true, mvp });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
