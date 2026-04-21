import { Product, ProfilePage, WithContext } from 'schema-dts';

interface GeoSchemaProps {
  product?: any;
  seller: any;
  platformName?: string;
  type: 'product' | 'profile';
}

export default function GeoSchemaBuilder({ product, seller, platformName = "تمكين", type }: GeoSchemaProps) {
  if (type === 'product' && product) {
    const productSchema: WithContext<Product> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${process.env.NEXT_PUBLIC_APP_URL || ''}/@${seller.username}/${product.slug}#product`,
      name: product.title,
      description: product.description?.replace(/<[^>]*>?/gm, ''),
      image: product.image,
      brand: {
        '@type': 'Organization',
        '@id': `${process.env.NEXT_PUBLIC_APP_URL || ''}/@${seller.username}#seller`,
        name: seller.name,
        url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/@${seller.username}`,
        sameAs: [seller.website, seller.twitter, seller.instagram, seller.facebook, seller.linkedin].filter(Boolean) as string[]
      } as any,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/@${seller.username}/${product.slug}`,
        seller: {
          '@type': 'Organization',
          name: platformName,
          url: process.env.NEXT_PUBLIC_APP_URL || ''
        }
      },
      ...(product.ratingCount > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.averageRating,
          reviewCount: product.ratingCount
        }
      })
    };

    // Auto-FAQ Generation (Rule-based + Manual)
    let faqs = Array.isArray(product.faqs) ? [...product.faqs] : [];
    
    if (faqs.length === 0) {
      faqs.push({
        question: `كم سعر ${product.title}؟`,
        answer: `سعر المنتج هو ${product.price}$ ويمكن شراؤه المباشر عبر منصة ${platformName}.`
      });
      faqs.push({
        question: `من هو مقدم ${product.title}؟`,
        answer: `تم إعداد وتوفير هذا المنتج بواسطة ${seller.name}.`
      });
      if (product.duration) {
        faqs.push({
          question: `ما هي مدة ${product.title}؟`,
          answer: `تستغرق المادة حوالي ${product.duration}.`
        });
      }
    }

    const faqSchema = faqs.length > 0 ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer
        }
      }))
    } : null;

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        )}
      </>
    );
  }

  if (type === 'profile') {
    const profileSchema: WithContext<ProfilePage> = {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      dateCreated: seller.createdAt,
      mainEntity: {
        '@type': 'Person',
        name: seller.name,
        identifier: seller.username,
        description: seller.bio,
        image: seller.avatar,
        interactionStatistic: [{
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/FollowAction',
          userInteractionCount: seller.followersCount || 0
        }] as any,
        sameAs: [seller.website, seller.twitter, seller.instagram, seller.facebook, seller.linkedin].filter(Boolean) as string[]
      }
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }}
      />
    );
  }

  return null;
}
