interface ParsedUrl {
  protocol: string;
  hostname: string;
  pathname: string;
  search: string;
  hash: string;
  isValid: boolean;
}

export const parseUrl = (url: string): ParsedUrl => {
  try {
    // Handle relative URLs
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    const urlObj = new URL(url);
    return {
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      pathname: urlObj.pathname,
      search: urlObj.search,
      hash: urlObj.hash,
      isValid: true
    };
  } catch (error) {
    return {
      protocol: '',
      hostname: '',
      pathname: '',
      search: '',
      hash: '',
      isValid: false
    };
  }
};

export const isInstagramUrl = (url: string): boolean => {
  const parsed = parseUrl(url);
  return parsed.hostname.includes('instagram.com');
};

export const isFacebookUrl = (url: string): boolean => {
  const parsed = parseUrl(url);
  return parsed.hostname.includes('facebook.com');
};

export const isTwitterUrl = (url: string): boolean => {
  const parsed = parseUrl(url);
  return parsed.hostname.includes('twitter.com') || parsed.hostname.includes('x.com');
};

export const isPinterestUrl = (url: string): boolean => {
  const parsed = parseUrl(url);
  return parsed.hostname.includes('pinterest.com');
};

export const isYouTubeUrl = (url: string): boolean => {
  const parsed = parseUrl(url);
  return parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be');
};

export const isTikTokUrl = (url: string): boolean => {
  const parsed = parseUrl(url);
  return parsed.hostname.includes('tiktok.com');
};

export const isSupportedUrl = (url: string): boolean => {
  const supportedDomains = [
    'instagram.com',
    'facebook.com',
    'twitter.com',
    'x.com',
    'pinterest.com',
    'youtube.com',
    'youtu.be',
    'tiktok.com',
    'foodnetwork.com',
    'allrecipes.com',
    'cooking.nytimes.com',
    'food.com',
    'epicurious.com',
    'tasty.co',
    'delish.com',
    'foodandwine.com',
    'cookinglight.com',
    'eatingwell.com',
    'simplyrecipes.com',
    'tasteofhome.com',
    'food52.com',
    'bonappetit.com',
    'cookstr.com',
    'food.com',
    'foodnetwork.com',
    'foodandwine.com',
    'cookinglight.com',
    'eatingwell.com',
    'simplyrecipes.com',
    'tasteofhome.com',
    'food52.com',
    'bonappetit.com',
    'cookstr.com'
  ];

  const parsed = parseUrl(url);
  return supportedDomains.some(domain => parsed.hostname.includes(domain));
};

export const getUrlType = (url: string): string => {
  if (isInstagramUrl(url)) return 'instagram';
  if (isFacebookUrl(url)) return 'facebook';
  if (isTwitterUrl(url)) return 'twitter';
  if (isPinterestUrl(url)) return 'pinterest';
  if (isYouTubeUrl(url)) return 'youtube';
  if (isTikTokUrl(url)) return 'tiktok';
  return 'general';
};

export const cleanUrl = (url: string): string => {
  try {
    const parsed = parseUrl(url);
    if (!parsed.isValid) return url;

    // Remove tracking parameters and clean up URLs
    const cleanParams = new URLSearchParams(parsed.search);
    cleanParams.delete('utm_source');
    cleanParams.delete('utm_medium');
    cleanParams.delete('utm_campaign');
    cleanParams.delete('utm_term');
    cleanParams.delete('utm_content');
    cleanParams.delete('fbclid');
    cleanParams.delete('ref');
    cleanParams.delete('source');
    cleanParams.delete('medium');
    cleanParams.delete('campaign');

    return `${parsed.protocol}//${parsed.hostname}${parsed.pathname}${cleanParams.toString() ? '?' + cleanParams.toString() : ''}${parsed.hash}`;
  } catch (error) {
    return url;
  }
}; 