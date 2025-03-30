import { parseUrl, isInstagramUrl, isFacebookUrl, isTwitterUrl, isPinterestUrl, isYouTubeUrl, isTikTokUrl, isSupportedUrl, getUrlType, cleanUrl } from '../urlParser';

describe('URL Parser', () => {
  describe('parseUrl', () => {
    it('should parse absolute URLs correctly', () => {
      const url = 'https://www.example.com/path?query=123#hash';
      const result = parseUrl(url);
      
      expect(result).toEqual({
        protocol: 'https',
        hostname: 'www.example.com',
        pathname: '/path',
        search: '?query=123',
        hash: '#hash',
        isValid: true
      });
    });

    it('should parse relative URLs correctly', () => {
      const url = '/path?query=123#hash';
      const result = parseUrl(url);
      
      expect(result).toEqual({
        protocol: '',
        hostname: '',
        pathname: '/path',
        search: '?query=123',
        hash: '#hash',
        isValid: true
      });
    });

    it('should handle invalid URLs', () => {
      const url = 'not-a-url';
      const result = parseUrl(url);
      
      expect(result.isValid).toBe(false);
    });
  });

  describe('Platform URL checks', () => {
    it('should identify Instagram URLs', () => {
      expect(isInstagramUrl('https://www.instagram.com/p/abc123')).toBe(true);
      expect(isInstagramUrl('https://instagram.com/p/abc123')).toBe(true);
      expect(isInstagramUrl('https://example.com')).toBe(false);
    });

    it('should identify Facebook URLs', () => {
      expect(isFacebookUrl('https://www.facebook.com/recipe/123')).toBe(true);
      expect(isFacebookUrl('https://facebook.com/recipe/123')).toBe(true);
      expect(isFacebookUrl('https://example.com')).toBe(false);
    });

    it('should identify Twitter URLs', () => {
      expect(isTwitterUrl('https://twitter.com/user/status/123')).toBe(true);
      expect(isTwitterUrl('https://x.com/user/status/123')).toBe(true);
      expect(isTwitterUrl('https://example.com')).toBe(false);
    });

    it('should identify Pinterest URLs', () => {
      expect(isPinterestUrl('https://www.pinterest.com/pin/123')).toBe(true);
      expect(isPinterestUrl('https://pinterest.com/pin/123')).toBe(true);
      expect(isPinterestUrl('https://example.com')).toBe(false);
    });

    it('should identify YouTube URLs', () => {
      expect(isYouTubeUrl('https://www.youtube.com/watch?v=123')).toBe(true);
      expect(isYouTubeUrl('https://youtu.be/123')).toBe(true);
      expect(isYouTubeUrl('https://example.com')).toBe(false);
    });

    it('should identify TikTok URLs', () => {
      expect(isTikTokUrl('https://www.tiktok.com/@user/video/123')).toBe(true);
      expect(isTikTokUrl('https://tiktok.com/@user/video/123')).toBe(true);
      expect(isTikTokUrl('https://example.com')).toBe(false);
    });
  });

  describe('isSupportedUrl', () => {
    it('should identify supported URLs', () => {
      expect(isSupportedUrl('https://www.instagram.com/p/abc123')).toBe(true);
      expect(isSupportedUrl('https://www.facebook.com/recipe/123')).toBe(true);
      expect(isSupportedUrl('https://twitter.com/user/status/123')).toBe(true);
      expect(isSupportedUrl('https://www.pinterest.com/pin/123')).toBe(true);
      expect(isSupportedUrl('https://www.youtube.com/watch?v=123')).toBe(true);
      expect(isSupportedUrl('https://www.tiktok.com/@user/video/123')).toBe(true);
      expect(isSupportedUrl('https://example.com')).toBe(false);
    });
  });

  describe('getUrlType', () => {
    it('should return correct URL type', () => {
      expect(getUrlType('https://www.instagram.com/p/abc123')).toBe('instagram');
      expect(getUrlType('https://www.facebook.com/recipe/123')).toBe('facebook');
      expect(getUrlType('https://twitter.com/user/status/123')).toBe('twitter');
      expect(getUrlType('https://www.pinterest.com/pin/123')).toBe('pinterest');
      expect(getUrlType('https://www.youtube.com/watch?v=123')).toBe('youtube');
      expect(getUrlType('https://www.tiktok.com/@user/video/123')).toBe('tiktok');
      expect(getUrlType('https://example.com')).toBe('unknown');
    });
  });

  describe('cleanUrl', () => {
    it('should remove tracking parameters', () => {
      const url = 'https://www.instagram.com/p/abc123?utm_source=facebook&utm_medium=social&utm_campaign=recipe';
      const cleaned = cleanUrl(url);
      
      expect(cleaned).toBe('https://www.instagram.com/p/abc123');
    });

    it('should handle URLs without tracking parameters', () => {
      const url = 'https://www.instagram.com/p/abc123';
      const cleaned = cleanUrl(url);
      
      expect(cleaned).toBe(url);
    });
  });
}); 