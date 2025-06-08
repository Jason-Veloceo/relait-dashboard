import BusinessDetails from '@/components/BusinessDetails';

export default function BusinessPage({ params }: { params: { businessId: string } }) {
  return (
    <main>
      <BusinessDetails businessId={parseInt(params.businessId)} />
    </main>
  );
} 