# Video Optimization Guide

## Current Setup

Your videos are currently:

- `tech-office.mp4`: 8.9MB (loads first - smallest)
- `business-meeting.mp4`: 20MB
- `meeting.mp4`: 28MB

**Total: ~57MB**

## Performance Optimizations Implemented

✅ **Crossfade Transitions**: Smooth 1-second fade between videos
✅ **Smart Loading**: First video (smallest) loads immediately, others lazy load
✅ **Dual Video Elements**: Enables seamless transitions
✅ **Preload Strategy**: Only first video uses `preload="auto"`

## For Production/SEO: Video Compression

Your videos are quite large. Here's how to optimize them:

### Option 1: HandBrake (Recommended)

1. Download [HandBrake](https://handbrake.fr/)
2. Settings:
   - Format: MP4
   - Video Codec: H.264
   - Quality: RF 24-26 (good balance)
   - Resolution: 1920x1080 or 1280x720
   - Frame Rate: 24 or 30 fps
   - **Target: 3-5MB per video**

### Option 2: FFmpeg Command Line

```bash
# Install ffmpeg
sudo apt install ffmpeg  # Linux
brew install ffmpeg      # Mac

# Compress videos
ffmpeg -i business-meeting.mp4 -vcodec h264 -crf 28 -preset slow business-meeting-compressed.mp4
ffmpeg -i tech-office.mp4 -vcodec h264 -crf 28 -preset slow tech-office-compressed.mp4
ffmpeg -i meeting.mp4 -vcodec h264 -crf 28 -preset slow meeting-compressed.mp4
```

### Option 3: Online Tools

- [CloudConvert](https://cloudconvert.com/mp4-converter)
- [FreeConvert](https://www.freeconvert.com/video-compressor)

Target settings:

- Resolution: 1280x720 (720p is fine for background)
- Bitrate: 1500-2000 kbps
- Target size: 3-5MB each

## Git & Vercel Deployment

✅ **Videos ARE included**: Files in `public/` folder automatically deploy to Vercel
✅ **No special setup needed**: Just push to git and deploy
⚠️ **Large files warning**: Consider compressing before committing

### If videos are too large for Git:

Option A: Use `.gitignore` and external CDN:

```
# Add to .gitignore
public/videos/*.mp4
```

Then host videos on:

- AWS S3
- Cloudflare R2
- Vercel Blob Storage

Option B: Git LFS (Large File Storage):

```bash
git lfs install
git lfs track "*.mp4"
git add .gitattributes
```

## SEO Impact

Current setup minimizes SEO impact:

- ✅ Videos don't block initial page render
- ✅ First/smallest video loads first
- ✅ Text content loads immediately
- ✅ Videos are background only (not content)

### Further SEO Optimization (Optional):

1. **Add poster images** (lightweight fallback):

```jsx
<video poster="/images/video-poster.jpg" ...>
```

2. **Lazy load on mobile**:

```jsx
// Only load videos on desktop
{
  !isMobile && <VideoBackground />;
}
```

3. **Consider using thumbnail for mobile**:

```jsx
{
  isMobile ? <img src="/images/hero-bg.jpg" /> : <VideoBackground />;
}
```

## Recommended Action

1. **Compress all videos to 3-5MB each** (total ~15MB)
2. **Replace files in `public/videos/`**
3. **Commit and deploy to Vercel**

This will:

- Reduce load time by 70%
- Improve Lighthouse scores
- Better mobile experience
- Same visual quality (background video doesn't need high res)

## Testing Performance

After optimization, test with:

- Chrome DevTools → Network tab
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)

Target: Total video size < 15MB
