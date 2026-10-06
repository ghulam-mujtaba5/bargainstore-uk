import React from "react";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/data";
import ProductForm from "@/components/ProductForm";

export const revalidate = 0;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(Number(id));

  if (!product) {
    notFound();
  }

  return <ProductForm initialData={product} isEdit={true} />;
}
