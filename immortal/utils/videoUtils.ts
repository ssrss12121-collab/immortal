export const getEmbedUrl = (url: string): string => {
    if (!url) return '';

    // If already an embed URL, return it
    if (url.includes('youtube.com/embed/')) return url;

    // Handle standard watch URLs, shorts, and embeds with any subdomain (typo resilient)
    const videoIdMatch = url.match(/(?:(?:[a-zA-Z\d-]+\.)?youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);

    if (videoIdMatch && videoIdMatch[1]) {
        return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }

    // Return original if regex fails (might be non-YT or already valid)
    return url;
};

export const getThumbnailUrl = (url: string): string => {
    if (!url) return '';
    const videoIdMatch = url.match(/(?:(?:[a-zA-Z\d-]+\.)?youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
        return `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
    }
    return 'https://via.placeholder.com/300x200?text=No+Thumbnail'; // Fallback
};
