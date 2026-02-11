# Folio Pricing Analysis

## Date: 2026-02-11

---

## Competitor Pricing

| Service | Free | Paid |
|---------|------|------|
| **LitLink** | Basic profile | ¥860/月 (raised from ¥660 in June 2025) |
| **LitLink (annual)** | - | ¥8,160/年 (¥680/月) |
| **Linktree** | Basic | Starter $5, Pro $9, Premium $24 |
| **Taplink** | Basic | Pro $3, Business $6 |

## Infrastructure Costs

### Current (Free Tiers)

| Service | Plan | Monthly Cost | Limits |
|---------|------|-------------|--------|
| Supabase | Free | ¥0 | 500MB DB, 1GB storage, 50K auth users |
| Vercel | Hobby | ¥0 | 100GB bandwidth, capped (no overages) |
| Resend | Free | ¥0 | 3,000 emails/month |
| Stripe | Pay-per-use | ¥0 base | 2.4% + ¥10 per transaction (Japan) |
| **Total** | | **¥0/month** | |

### Scaling Costs (When Needed)

| Service | Plan | Monthly Cost | Limits |
|---------|------|-------------|--------|
| Supabase | Pro | $25 (¥3,750) | 8GB DB, 100GB storage, unlimited auth |
| Vercel | Pro | $20 (¥3,000) | 1TB bandwidth, pay-as-you-go overages |
| Resend | Pro | $20 (¥3,000) | 50,000 emails/month |
| **Total** | | **~$65 (¥9,750)/month** | |

### When to Upgrade

- **Supabase**: When DB > 500MB or storage > 1GB (~500+ users with images)
- **Vercel**: When traffic exceeds 100GB/month or need team features
- **Resend**: When sending > 3,000 emails/month (~60 Pro+ users sending campaigns)

## Per-User Variable Cost Analysis

| Feature | Storage/Compute | Cost/user/month | Tier |
|---------|----------------|-----------------|------|
| Avatar + profile page | ~0.5MB storage | ~¥0.01 | Free |
| Custom templates + fonts | 0 (CSS only) | ¥0 | Pro |
| Rich text content | ~1KB DB | ~¥0 | Pro |
| Image slides (10 max) | ~5MB storage | ~¥0.1 | Pro |
| Custom OG image | ~200KB storage | ~¥0.01 | Pro |
| Analytics (page views) | DB rows | ~¥0.05 | Pro |
| Booking calendar | DB rows | ~¥0.05 | Pro |
| Reviews | DB rows | ~¥0.02 | Pro |
| Stamp cards | DB rows | ~¥0.02 | Pro |
| Video background | ~20MB storage | ~¥0.4 | Pro+ |
| CRM / Customers | DB rows + queries | ~¥0.5 | Pro+ |
| Email sending (50/mo) | Resend API | ~¥2 | Pro+ |
| Email sending (200/mo) | Resend API | ~¥8 | Pro+ |
| Auto follow-ups | Cron compute + email | ~¥3 | Pro+ |
| Customer segments | DB compute | ~¥0.3 | Pro+ |
| LINE integration | Webhook compute | ~¥0.1 | Pro+ |
| Custom domain | DNS verification | ~¥0.1 | Pro+ |

**Max per-user cost**: ~¥15/month for heaviest Pro+ user

## Pricing Tiers

### Free - ¥0/月

- 4 free templates
- Up to 5 links
- Contact form
- QR code download
- vCard download
- Social links
- Basic page view count
- "Powered by Folio" branding

### Pro - ¥480/月 (年払い ¥3,980/年 = ¥332/月)

Everything in Free, plus:
- All 56 templates
- 7 custom fonts
- Custom colors (accent, background, text)
- Rich text free input section
- Image slides / content sections
- Custom OG share image + title
- Booking calendar
- Review collection
- Full analytics
- Stamp cards / coupons
- Email subscriber collection
- Unlimited links
- Remove "Powered by Folio" branding

### Pro+ - ¥1,480/月 (年払い ¥11,800/年 = ¥983/月)

Everything in Pro, plus:
- Video backgrounds
- CRM / Customer management
- Message sending (email campaigns)
- Automated follow-ups
- Customer segmentation
- Campaigns & referrals
- LINE integration
- Custom domain
- Priority support

## ROI / Breakeven Analysis

### Breakeven Points

| Scenario | Revenue | Cost | Margin |
|----------|---------|------|--------|
| 20 Pro users | ¥9,600/mo | ¥9,750/mo (scaled infra) | -2% (breakeven) |
| 50 Pro users | ¥24,000/mo | ¥9,750/mo | 59% |
| 100 Pro + 10 Pro+ | ¥62,800/mo | ¥10,500/mo | 83% |
| 500 Pro + 30 Pro+ | ¥284,400/mo | ¥12,000/mo | 96% |
| 1,000 Pro + 50 Pro+ | ¥554,000/mo | ¥15,000/mo | 97% |

### Free Tier Phase (Current)

- Running cost: ¥0/month (+ domain cost)
- Can support ~500 free users before needing Supabase upgrade
- Can support ~100 users with images before hitting 1GB storage
- Can send 3,000 emails/month before needing Resend upgrade

### Stripe Revenue Per Transaction

- Stripe fee (Japan): 3.6% per transaction
- Pro monthly ¥480: Stripe takes ¥17, net ¥463
- Pro annual ¥3,980: Stripe takes ¥143, net ¥3,837
- Pro+ monthly ¥1,480: Stripe takes ¥53, net ¥1,427
- Pro+ annual ¥11,800: Stripe takes ¥425, net ¥11,375

## Competitive Advantage vs LitLink

| Feature | LitLink+ (¥860/月) | Folio Pro (¥480/月) | Folio Pro+ (¥1,480/月) |
|---------|---------------------|---------------------|------------------------|
| Price | ¥860 | **¥480 (-44%)** | ¥1,480 |
| Templates | Limited | 56 templates | 56 templates |
| Custom fonts | Some | 7 fonts | 7 fonts |
| Booking calendar | No | **Yes** | **Yes** |
| Reviews | No | **Yes** | **Yes** |
| Stamp cards | No | **Yes** | **Yes** |
| CRM | No | No | **Yes** |
| Email marketing | No | No | **Yes** |
| Auto follow-ups | No | No | **Yes** |
| LINE integration | No | No | **Yes** |
| Custom domain | No | No | **Yes** |
| Analytics | Basic | Full | Full |
| Rich text | No | **Yes** | **Yes** |
| Video backgrounds | Live wallpaper | No | **Yes** |
| Image slides | No | **Yes** | **Yes** |

## Key Messaging

- "LitLinkの半額以下で、10倍の機能" (Less than half the price of LitLink, 10x the features)
- Pro at ¥480 = ¥332/month annual = cheaper than a coffee
- Pro+ includes full marketing suite that competitors charge $50+/month for separately
