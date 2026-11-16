import OrderDetailPage from "../../../components/OrderDetailPage";

export default async function Page({ params }) {
  const { id } = await params;
  return <OrderDetailPage id={id} />;
}
