import { redirect } from "next/navigation";

interface DishDetailsPageProps {
  params: Promise<{ id: string; dishId: string }>;
}

export default async function DishDetailsPage({ params }: DishDetailsPageProps) {
  const { id } = await params;
  redirect(`/restaurants/${id}`);
}
