import dynamic from 'next/dynamic';

export const dynamic = 'force-dynamic';

const CreateMarketClient = dynamic(() => import('./CreateMarketClient'), {
  ssr: false,
});

export default function CreateMarketPage() {
  return <CreateMarketClient />;
}
