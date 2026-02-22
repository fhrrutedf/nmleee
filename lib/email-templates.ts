// ============================================================
// قوالب الإيميلات - Automation Email Templates
// ============================================================

const baseStyle = `
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  direction: rtl;
  text-align: right;
  background: #f8fafc;
  margin: 0;
  padding: 0;
`;

const containerStyle = `
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
`;

const headerStyle = (color: string) => `
  background: linear-gradient(135deg, ${color}, ${color}cc);
  padding: 40px 32px;
  text-align: center;
`;

const bodyStyle = `
  padding: 36px 32px;
`;

const btnStyle = (color: string) => `
  display: inline-block;
  background: ${color};
  color: #ffffff !important;
  padding: 14px 32px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  font-size: 16px;
  margin: 16px 0;
`;

const footerStyle = `
  background: #f8fafc;
  padding: 20px 32px;
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
  border-top: 1px solid #e2e8f0;
`;

function wrapEmail(content: string, sellerName: string, brandColor = '#0ea5e9') {
    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
</head>
<body style="${baseStyle}">
  <div style="${containerStyle}">
    <div style="${headerStyle(brandColor)}">
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">${sellerName}</h1>
    </div>
    <div style="${bodyStyle}">
      ${content}
    </div>
    <div style="${footerStyle}">
      <p>تم إرسال هذا الإيميل بواسطة ${sellerName}</p>
      <p>إذا لم تتوقع استلام هذا الإيميل يمكنك تجاهله</p>
    </div>
  </div>
</body>
</html>`;
}

// 1. Welcome Email Template
export function welcomeEmailTemplate({
    customerName,
    sellerName,
    brandColor,
    customBody,
    productName,
}: {
    customerName: string;
    sellerName: string;
    brandColor?: string;
    customBody?: string;
    productName?: string;
}) {
    const color = brandColor || '#0ea5e9';
    const content = customBody
        ? `<p style="font-size:16px;line-height:1.8;color:#334155;">${customBody.replace(/\n/g, '<br>')}</p>`
        : `
      <h2 style="color:#1e293b;font-size:22px;margin-bottom:8px;">مرحباً ${customerName}! 🎉</h2>
      <p style="font-size:16px;line-height:1.8;color:#334155;">
        شكراً لشرائك ${productName ? `<strong>${productName}</strong>` : 'من متجرنا'}. نحن سعداء جداً بانضمامك!
      </p>
      <p style="font-size:16px;line-height:1.8;color:#334155;">
        إذا كان لديك أي سؤال أو احتجت أي مساعدة، لا تتردد في التواصل معنا.
      </p>
      <p style="font-size:16px;color:#334155;margin-top:24px;">مع تمنياتنا بتجربة ممتازة 🚀</p>
    `;
    return wrapEmail(content, sellerName, color);
}

// 2. Abandoned Cart Reminder Templates
export function cartReminderTemplate({
    customerName,
    sellerName,
    brandColor,
    reminderNumber,
    products,
    totalAmount,
    customBody,
    discountPercent,
    checkoutUrl,
}: {
    customerName: string;
    sellerName: string;
    brandColor?: string;
    reminderNumber: 1 | 2 | 3;
    products: string[];
    totalAmount: number;
    customBody?: string;
    discountPercent?: number;
    checkoutUrl: string;
}) {
    const color = brandColor || '#0ea5e9';
    const titles = [
        '🛒 نسيت شيئاً في سلتك!',
        '⏰ لا تفوّت ما اخترته!',
        '🎁 عرض خاص لك فقط!',
    ];

    const defaults = [
        `مرحباً ${customerName}،\n\nلاحظنا أنك أضفت بعض المنتجات الرائعة لسلتك ولم تكمل الشراء بعد:\n\n${products.join('\n')}\n\nإجمالي السلة: ${totalAmount} $\n\nانقر على الزر أدناه لإتمام طلبك الآن!`,
        `مرحباً ${customerName}،\n\nمنتجاتك لا تزال تنتظرك! هذه المنتجات التي اخترتها تستحق الانضمام إليك:\n\n${products.join('\n')}\n\nلا تدع هذه الفرصة تفوتك!`,
        `مرحباً ${customerName}،\n\nهذه آخر فرصة! لديك منتجات رائعة في سلتك.\n${discountPercent ? `حصلت على خصم ${discountPercent}% خاص لك فقط!` : ''}\n\nأتمم طلبك الآن قبل انتهاء العرض!`,
    ];

    const bodyText = customBody || defaults[reminderNumber - 1];
    const content = `
    <h2 style="color:#1e293b;font-size:22px;margin-bottom:16px;">${titles[reminderNumber - 1]}</h2>
    <p style="font-size:16px;line-height:1.8;color:#334155;">${bodyText.replace(/\n/g, '<br>')}</p>
    ${discountPercent && reminderNumber === 3 ? `
      <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:16px;margin:20px 0;text-align:center;">
        <p style="color:#16a34a;font-size:24px;font-weight:800;margin:0;">خصم ${discountPercent}% 🎉</p>
        <p style="color:#15803d;margin:4px 0;">على جميع منتجات سلتك</p>
      </div>
    ` : ''}
    <div style="text-align:center;margin-top:24px;">
      <a href="${checkoutUrl}" style="${btnStyle(color)}">أكمل الشراء الآن</a>
    </div>
    <p style="font-size:14px;color:#94a3b8;margin-top:20px;">إجمالي سلتك: <strong>${totalAmount} $</strong></p>
  `;
    return wrapEmail(content, sellerName, color);
}

// 3. Post-Purchase: Review Request (7 days)
export function reviewRequestTemplate({
    customerName,
    sellerName,
    brandColor,
    productName,
    reviewUrl,
    customBody,
}: {
    customerName: string;
    sellerName: string;
    brandColor?: string;
    productName: string;
    reviewUrl: string;
    customBody?: string;
}) {
    const color = brandColor || '#0ea5e9';
    const content = customBody
        ? `<p style="font-size:16px;line-height:1.8;color:#334155;">${customBody.replace(/\n/g, '<br>')}</p>
       <div style="text-align:center;margin-top:24px;"><a href="${reviewUrl}" style="${btnStyle(color)}">اترك تقييمك ⭐</a></div>`
        : `
      <h2 style="color:#1e293b;font-size:22px;margin-bottom:8px;">كيف تجد تجربتك؟ ⭐</h2>
      <p style="font-size:16px;line-height:1.8;color:#334155;">
        مرحباً ${customerName}، مرّت أسبوع منذ شرائك <strong>${productName}</strong>.
        نود معرفة رأيك وتجربتك مع المنتج!
      </p>
      <p style="font-size:16px;line-height:1.8;color:#334155;">
        مراجعتك تساعد الآخرين وتساعدنا في تحسين خدمتنا. يستغرق الأمر دقيقة واحدة فقط!
      </p>
      <div style="text-align:center;margin-top:24px;">
        <a href="${reviewUrl}" style="${btnStyle(color)}">اترك تقييمك الآن ⭐</a>
      </div>
    `;
    return wrapEmail(content, sellerName, color);
}

// 4. Post-Purchase: Upsell (30 days)
export function upsellTemplate({
    customerName,
    sellerName,
    brandColor,
    products,
    storeUrl,
    customBody,
}: {
    customerName: string;
    sellerName: string;
    brandColor?: string;
    products: { name: string; price: number; url: string }[];
    storeUrl: string;
    customBody?: string;
}) {
    const color = brandColor || '#0ea5e9';
    const productCards = products.map(p => `
    <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:12px;">
      <strong style="color:#1e293b;">${p.name}</strong>
      <span style="float:left;color:${color};font-weight:700;">${p.price} $</span>
      <br><br>
      <a href="${p.url}" style="color:${color};text-decoration:none;font-size:14px;">عرض المنتج ←</a>
    </div>
  `).join('');

    const content = `
    <h2 style="color:#1e293b;font-size:22px;margin-bottom:8px;">منتجات قد تعجبك أيضاً 🚀</h2>
    <p style="font-size:16px;line-height:1.8;color:#334155;">
      ${customBody || `مرحباً ${customerName}، لدينا منتجات جديدة رائعة قد تناسبك!`}
    </p>
    ${productCards}
    <div style="text-align:center;margin-top:24px;">
      <a href="${storeUrl}" style="${btnStyle(color)}">تصفح المتجر كاملاً</a>
    </div>
  `;
    return wrapEmail(content, sellerName, color);
}

// 5. Subscription Reminder
export function subscriptionReminderTemplate({
    customerName,
    sellerName,
    brandColor,
    planName,
    expiresAt,
    renewUrl,
    daysLeft,
}: {
    customerName: string;
    sellerName: string;
    brandColor?: string;
    planName: string;
    expiresAt: string;
    renewUrl: string;
    daysLeft: number;
}) {
    const color = brandColor || '#0ea5e9';
    const urgency = daysLeft <= 1 ? '🚨 تنبيه هام!' : daysLeft <= 3 ? '⚠️ تذكير مهم' : '📅 تذكير بالاشتراك';
    const content = `
    <h2 style="color:#1e293b;font-size:22px;margin-bottom:8px;">${urgency}</h2>
    <p style="font-size:16px;line-height:1.8;color:#334155;">
      مرحباً ${customerName}، اشتراكك في <strong>${planName}</strong> سينتهي خلال <strong>${daysLeft} ${daysLeft === 1 ? 'يوم' : 'أيام'}</strong>.
    </p>
    <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;padding:16px;margin:20px 0;text-align:center;">
      <p style="color:#c2410c;font-size:18px;font-weight:700;margin:0;">تاريخ الانتهاء: ${expiresAt}</p>
    </div>
    <p style="font-size:16px;color:#334155;">جدّد اشتراكك الآن للاستمرار في الاستفادة من الخدمة دون انقطاع!</p>
    <div style="text-align:center;margin-top:24px;">
      <a href="${renewUrl}" style="${btnStyle(color)}">جدّد الاشتراك الآن</a>
    </div>
  `;
    return wrapEmail(content, sellerName, color);
}

// 6. Weekly Report Template
export function weeklyReportTemplate({
    sellerName,
    brandColor,
    reportData,
    weekNumber,
}: {
    sellerName: string;
    brandColor?: string;
    reportData: {
        sales: number;
        revenue: number;
        newCustomers: number;
        topProduct: string;
        newReviews: number;
        prevRevenue?: number;
    };
    weekNumber?: number;
}) {
    const color = brandColor || '#0ea5e9';
    const change = reportData.prevRevenue
        ? ((reportData.revenue - reportData.prevRevenue) / reportData.prevRevenue * 100).toFixed(1)
        : null;
    const changeColor = change && parseFloat(change) >= 0 ? '#16a34a' : '#dc2626';
    const changeIcon = change && parseFloat(change) >= 0 ? '↑' : '↓';

    const content = `
    <h2 style="color:#1e293b;font-size:22px;margin-bottom:4px;">📊 تقريرك ${weekNumber ? `- الأسبوع ${weekNumber}` : 'الأسبوعي'}</h2>
    <p style="color:#94a3b8;font-size:14px;margin-bottom:24px;">ملخص أداء متجرك هذا الأسبوع</p>
    
    <div style="display:grid;gap:12px;">
      ${[
            { label: '💰 الإيرادات', value: `${reportData.revenue.toFixed(2)} $`, extra: change ? `<span style="color:${changeColor};font-size:12px;">${changeIcon} ${Math.abs(parseFloat(change))}%</span>` : '' },
            { label: '🛍️ عدد المبيعات', value: reportData.sales.toString() },
            { label: '👥 عملاء جدد', value: reportData.newCustomers.toString() },
            { label: '⭐ تقييمات جديدة', value: reportData.newReviews.toString() },
            { label: '🏆 أكثر منتج مبيعاً', value: reportData.topProduct },
        ].map(stat => `
        <div style="background:#f8fafc;border-radius:12px;padding:16px;border-right:4px solid ${color};">
          <div style="color:#64748b;font-size:13px;margin-bottom:4px;">${stat.label}</div>
          <div style="color:#1e293b;font-size:22px;font-weight:800;">${stat.value} ${stat.extra || ''}</div>
        </div>
      `).join('')}
    </div>
  `;
    return wrapEmail(content, sellerName, color);
}

// 7. Educational Follow-up
export function eduFollowupTemplate({
    studentName,
    sellerName,
    brandColor,
    courseName,
    progressPercent,
    remainingLessons,
    continueUrl,
}: {
    studentName: string;
    sellerName: string;
    brandColor?: string;
    courseName: string;
    progressPercent: number;
    remainingLessons?: number;
    continueUrl: string;
}) {
    const color = brandColor || '#0ea5e9';
    const emoji = progressPercent >= 80 ? '🏆' : progressPercent >= 50 ? '🚀' : '💪';
    const content = `
    <h2 style="color:#1e293b;font-size:22px;margin-bottom:8px;">${emoji} كمّل مسيرتك التعليمية!</h2>
    <p style="font-size:16px;line-height:1.8;color:#334155;">
      مرحباً ${studentName}، لاحظنا أنك لم تكمل كورس <strong>${courseName}</strong> منذ أسبوع!
    </p>
    
    <div style="background:#f0f9ff;border-radius:12px;padding:16px;margin:20px 0;">
      <p style="color:#0369a1;margin:0 0 8px;">تقدّمك الحالي</p>
      <div style="background:#e0f2fe;border-radius:999px;height:12px;overflow:hidden;">
        <div style="background:${color};width:${progressPercent}%;height:100%;border-radius:999px;transition:width 0.3s;"></div>
      </div>
      <p style="color:#0369a1;font-size:14px;margin:8px 0 0;">${progressPercent}% مكتمل ${remainingLessons ? `• باقي ${remainingLessons} دروس فقط!` : ''}</p>
    </div>
    
    <p style="font-size:16px;color:#334155;">أنت أقرب مما تتصور من إكمال الكورس والحصول على شهادتك!</p>
    <div style="text-align:center;margin-top:24px;">
      <a href="${continueUrl}" style="${btnStyle(color)}">كمّل الكورس الآن 🎯</a>
    </div>
  `;
    return wrapEmail(content, sellerName, color);
}

// 8. Course Completion Congratulations
export function courseCompletionTemplate({
    studentName,
    sellerName,
    brandColor,
    courseName,
    certificateUrl,
    nextCourseUrl,
    nextCourseName,
}: {
    studentName: string;
    sellerName: string;
    brandColor?: string;
    courseName: string;
    certificateUrl?: string;
    nextCourseUrl?: string;
    nextCourseName?: string;
}) {
    const color = brandColor || '#0ea5e9';
    const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:64px;">🎓</div>
      <h2 style="color:#1e293b;font-size:26px;margin:8px 0;">تهانينا ${studentName}!</h2>
      <p style="color:#64748b;font-size:16px;">أتممت كورس <strong>${courseName}</strong> بنجاح!</p>
    </div>
    ${certificateUrl ? `
      <div style="text-align:center;margin:24px 0;">
        <a href="${certificateUrl}" style="${btnStyle('#16a34a')}">📜 تحميل شهادتك</a>
      </div>
    ` : ''}
    ${nextCourseName && nextCourseUrl ? `
      <div style="background:#f0f9ff;border-radius:12px;padding:20px;margin-top:24px;text-align:center;">
        <p style="color:#0369a1;font-weight:700;margin:0 0 8px;">الخطوة التالية في مسيرتك</p>
        <p style="color:#1e293b;font-size:16px;margin:0 0 16px;">${nextCourseName}</p>
        <a href="${nextCourseUrl}" style="${btnStyle(color)}">ابدأ الكورس التالي 🚀</a>
      </div>
    ` : ''}
  `;
    return wrapEmail(content, sellerName, color);
}

// 9. Marketing / Promotional Email
export function marketingEmailTemplate({
    customerName,
    sellerName,
    brandColor,
    subject,
    body,
    discountCode,
    discountPercent,
    ctaUrl,
    ctaText,
}: {
    customerName: string;
    sellerName: string;
    brandColor?: string;
    subject: string;
    body: string;
    discountCode?: string;
    discountPercent?: number;
    ctaUrl?: string;
    ctaText?: string;
}) {
    const color = brandColor || '#0ea5e9';
    const content = `
    <h2 style="color:#1e293b;font-size:22px;margin-bottom:8px;">${subject}</h2>
    <p style="font-size:16px;line-height:1.8;color:#334155;">${body.replace(/\n/g, '<br>')}</p>
    ${discountCode && discountPercent ? `
      <div style="background:#f0fdf4;border:2px dashed #86efac;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
        <p style="color:#16a34a;font-size:13px;margin:0 0 4px;">كود الخصم الخاص بك</p>
        <p style="color:#16a34a;font-size:28px;font-weight:900;margin:0;letter-spacing:4px;">${discountCode}</p>
        <p style="color:#15803d;font-size:14px;margin:4px 0 0;">خصم ${discountPercent}% على جميع المنتجات</p>
      </div>
    ` : ''}
    ${ctaUrl ? `
      <div style="text-align:center;margin-top:24px;">
        <a href="${ctaUrl}" style="${btnStyle(color)}">${ctaText || 'تسوّق الآن'}</a>
      </div>
    ` : ''}
  `;
    return wrapEmail(content, sellerName, color);
}
