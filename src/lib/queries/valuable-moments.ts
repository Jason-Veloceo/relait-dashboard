import { query } from '@/lib/db';

export interface ValuableMomentMetrics {
  businessId: number;
  businessName: string;
  emailsSent: number;
  questionsAnswered: number;
  socialPosts: number;
  socialPostsRelait?: number;
  contentAdded: number;
  psAnnouncements: number;
  draftAnnouncements: number;
  draftReports: number;
  totalVM: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export async function getEmailMetrics(businessIds: number[] | null, dateRange: DateRange) {
  const businessFilter = businessIds?.length 
    ? 'AND u.id = ANY($3)'
    : '';
  
  return query<{ business_id: number; business_name: string; count: number }>(
    `SELECT 
      u.id as business_id,
      u.business_name,
      COUNT(e.id)::int as count
    FROM users u
    LEFT JOIN emails e ON e.business_id = u.id
      AND e.status = 'SENT'
      AND e.created_on >= $1 
      AND e.created_on <= $2
    WHERE u.user_type = 'BUSINESS'
      AND u.deleted IS NOT TRUE
      AND u.active = TRUE
      ${businessFilter}
    GROUP BY u.id, u.business_name
    ORDER BY u.business_name`,
    businessIds?.length 
      ? [dateRange.startDate, dateRange.endDate, businessIds]
      : [dateRange.startDate, dateRange.endDate]
  );
}

export async function getQuestionsMetrics(businessIds: number[] | null, dateRange: DateRange) {
  const businessFilter = businessIds?.length 
    ? 'AND u.id = ANY($3)'
    : '';

  return query<{ business_id: number; business_name: string; count: number }>(
    `SELECT 
      u.id as business_id,
      u.business_name,
      COUNT(q.id)::int as count
    FROM users u
    LEFT JOIN questions q ON q.business_id = u.id
      AND q.status = 'ANSWERED'
      AND q.answer_date >= $1 
      AND q.answer_date <= $2
    WHERE u.user_type = 'BUSINESS'
      AND u.deleted IS NOT TRUE
      AND u.active = TRUE
      ${businessFilter}
    GROUP BY u.id, u.business_name
    ORDER BY u.business_name`,
    businessIds?.length 
      ? [dateRange.startDate, dateRange.endDate, businessIds]
      : [dateRange.startDate, dateRange.endDate]
  );
}

export async function getSocialPostMetrics(businessIds: number[] | null, dateRange: DateRange) {
  const businessFilter = businessIds?.length 
    ? 'AND u.id = ANY($3)'
    : '';

  return query<{ business_id: number; business_name: string; count: number; relait_count: number }>(
    `SELECT 
      u.id as business_id,
      u.business_name,
      COUNT(sp.id)::int as count,
      COALESCE(SUM(CASE WHEN sp.content_id IS NOT NULL THEN 1 ELSE 0 END), 0)::int as relait_count
    FROM users u
    LEFT JOIN social_post sp ON sp.business_id = u.id
      AND sp.status = 'POSTED'
      AND sp.posted_date >= $1 
      AND sp.posted_date <= $2
    WHERE u.user_type = 'BUSINESS'
      AND u.deleted IS NOT TRUE
      AND u.active = TRUE
      ${businessFilter}
    GROUP BY u.id, u.business_name
    ORDER BY u.business_name`,
    businessIds?.length 
      ? [dateRange.startDate, dateRange.endDate, businessIds]
      : [dateRange.startDate, dateRange.endDate]
  );
}

export async function getContentMetrics(businessIds: number[] | null, dateRange: DateRange) {
  const businessFilter = businessIds?.length 
    ? 'AND u.id = ANY($3)'
    : '';

  return query<{ business_id: number; business_name: string; count: number }>(
    `SELECT 
      u.id as business_id,
      u.business_name,
      COUNT(cp.id)::int as count
    FROM users u
    LEFT JOIN content_page cp ON cp.business_id = u.id
      AND cp.types IN ('PDF', 'YOUTUBE', 'CONTENT')
      AND cp.created_on >= $1 
      AND cp.created_on <= $2
      AND cp.headline_id IS NULL
    WHERE u.user_type = 'BUSINESS'
      AND u.deleted IS NOT TRUE
      AND u.active = TRUE
      ${businessFilter}
    GROUP BY u.id, u.business_name
    ORDER BY u.business_name`,
    businessIds?.length 
      ? [dateRange.startDate, dateRange.endDate, businessIds]
      : [dateRange.startDate, dateRange.endDate]
  );
}

export async function getPSAnnouncementsMetrics(businessIds: number[] | null, dateRange: DateRange) {
  const businessFilter = businessIds?.length 
    ? 'AND u.id = ANY($3)'
    : '';

  return query<{ business_id: number; business_name: string; count: number }>(
    `SELECT 
      u.id as business_id,
      u.business_name,
      COUNT(cp.id)::int as count
    FROM users u
    LEFT JOIN content_page cp ON cp.business_id = u.id
      AND cp.category = 'ANNOUNCEMENT'
      AND cp.publish >= $1 
      AND cp.publish <= $2
      AND EXISTS (
        SELECT 1 FROM unnest(cp.labels) AS label WHERE label ILIKE '%Price Sensitive%'
      )
    WHERE u.user_type = 'BUSINESS'
      AND u.deleted IS NOT TRUE
      AND u.active = TRUE
      ${businessFilter}
    GROUP BY u.id, u.business_name
    ORDER BY u.business_name`,
    businessIds?.length 
      ? [dateRange.startDate, dateRange.endDate, businessIds]
      : [dateRange.startDate, dateRange.endDate]
  );
}

export async function getDraftAnnouncementsMetrics(businessIds: number[] | null, dateRange: DateRange) {
  const businessFilter = businessIds?.length 
    ? 'AND u.id = ANY($3)'
    : '';

  return query<{ business_id: number; business_name: string; count: number }>(
    `SELECT 
      u.id as business_id,
      u.business_name,
      COUNT(a.id)::int as count
    FROM users u
    LEFT JOIN asx_announcements a ON a.business_id = u.id
      AND a.created_on >= $1 
      AND a.created_on <= $2
    WHERE u.user_type = 'BUSINESS'
      AND u.deleted IS NOT TRUE
      AND u.active = TRUE
      ${businessFilter}
    GROUP BY u.id, u.business_name
    ORDER BY u.business_name`,
    businessIds?.length 
      ? [dateRange.startDate, dateRange.endDate, businessIds]
      : [dateRange.startDate, dateRange.endDate]
  );
}

export async function getDraftReportsMetrics(businessIds: number[] | null, dateRange: DateRange) {
  const businessFilter = businessIds?.length 
    ? 'AND u.id = ANY($3)'
    : '';

  return query<{ business_id: number; business_name: string; count: number }>(
    `SELECT 
      u.id as business_id,
      u.business_name,
      COUNT(r.id)::int as count
    FROM users u
    LEFT JOIN company_reports r ON r.business_id = u.id
      AND r.created_on >= $1 
      AND r.created_on <= $2
    WHERE u.user_type = 'BUSINESS'
      AND u.deleted IS NOT TRUE
      AND u.active = TRUE
      ${businessFilter}
    GROUP BY u.id, u.business_name
    ORDER BY u.business_name`,
    businessIds?.length 
      ? [dateRange.startDate, dateRange.endDate, businessIds]
      : [dateRange.startDate, dateRange.endDate]
  );
}

export async function getAllValuableMoments(businessIds: number[] | null, dateRange: DateRange): Promise<ValuableMomentMetrics[]> {
  const [emails, questions, socialPosts, content, psAnnouncements, draftAnnouncements, draftReports] = await Promise.all([
    getEmailMetrics(businessIds, dateRange),
    getQuestionsMetrics(businessIds, dateRange),
    getSocialPostMetrics(businessIds, dateRange),
    getContentMetrics(businessIds, dateRange),
    getPSAnnouncementsMetrics(businessIds, dateRange),
    getDraftAnnouncementsMetrics(businessIds, dateRange),
    getDraftReportsMetrics(businessIds, dateRange)
  ]);

  // Collect all unique businesses from all result sets
  const allBusinesses = new Map<number, { business_id: number; business_name: string }>();
  
  [...emails, ...questions, ...socialPosts, ...content, ...psAnnouncements, ...draftAnnouncements, ...draftReports].forEach(business => {
    if (!allBusinesses.has(business.business_id)) {
      allBusinesses.set(business.business_id, {
        business_id: business.business_id,
        business_name: business.business_name
      });
    }
  });

  // Convert to metrics for all businesses
  return Array.from(allBusinesses.values()).map(business => {
    const emailData = emails.find(e => e.business_id === business.business_id);
    const questionData = questions.find(q => q.business_id === business.business_id);
    const socialData = socialPosts.find(s => s.business_id === business.business_id);
    const socialRelait = socialPosts.find(s => s.business_id === business.business_id) as { business_id: number; business_name: string; count: number; relait_count: number } | undefined;
    const contentData = content.find(c => c.business_id === business.business_id);
    const psData = psAnnouncements.find(p => p.business_id === business.business_id);
    const draftAnnData = draftAnnouncements.find(d => d.business_id === business.business_id);
    const draftRepData = draftReports.find(d => d.business_id === business.business_id);

    const emailsSent = emailData?.count || 0;
    const questionsAnswered = questionData?.count || 0;
    const socialPostsCount = socialData?.count || 0;
    const socialPostsRelait = (socialRelait?.relait_count as number | undefined) || 0;
    const contentAdded = contentData?.count || 0;
    const psAnnouncementsCount = psData?.count || 0;
    const draftAnnouncementsCount = draftAnnData?.count || 0;
    const draftReportsCount = draftRepData?.count || 0;

    return {
      businessId: business.business_id,
      businessName: business.business_name,
      emailsSent,
      questionsAnswered,
      socialPosts: socialPostsCount,
      socialPostsRelait,
      contentAdded,
      psAnnouncements: psAnnouncementsCount,
      draftAnnouncements: draftAnnouncementsCount,
      draftReports: draftReportsCount,
      totalVM: emailsSent + questionsAnswered + socialPostsCount + contentAdded + draftAnnouncementsCount + draftReportsCount
    };
  });
} 