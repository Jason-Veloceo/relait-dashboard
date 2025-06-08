import { query } from '@/lib/db';

export interface ValuableMomentMetrics {
  businessId: number;
  businessName: string;
  emailsSent: number;
  questionsAnswered: number;
  socialPosts: number;
  contentAdded: number;
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
      COUNT(e.id) as count
    FROM users u
    LEFT JOIN emails e ON e.business_id = u.id
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
      COUNT(q.id) as count
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

  return query<{ business_id: number; business_name: string; count: number }>(
    `SELECT 
      u.id as business_id,
      u.business_name,
      COUNT(sp.id) as count
    FROM users u
    LEFT JOIN social_post sp ON sp.business_id = u.id
      AND sp.status = 'POSTED'
      AND sp.created_on >= $1 
      AND sp.created_on <= $2
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
      COUNT(cp.id) as count
    FROM users u
    LEFT JOIN content_page cp ON cp.business_id = u.id
      AND cp.types IN ('PDF', 'YOUTUBE', 'CONTENT')
      AND cp.created_on >= $1 
      AND cp.created_on <= $2
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
  const [emails, questions, socialPosts, content] = await Promise.all([
    getEmailMetrics(businessIds, dateRange),
    getQuestionsMetrics(businessIds, dateRange),
    getSocialPostMetrics(businessIds, dateRange),
    getContentMetrics(businessIds, dateRange)
  ]);

  // Since we're now getting all businesses from each query,
  // we can use any of the result sets as our base list of businesses
  return emails.map(business => {
    const questionData = questions.find(q => q.business_id === business.business_id);
    const socialData = socialPosts.find(s => s.business_id === business.business_id);
    const contentData = content.find(c => c.business_id === business.business_id);

    return {
      businessId: business.business_id,
      businessName: business.business_name,
      emailsSent: business.count || 0,
      questionsAnswered: questionData?.count || 0,
      socialPosts: socialData?.count || 0,
      contentAdded: contentData?.count || 0
    };
  });
} 