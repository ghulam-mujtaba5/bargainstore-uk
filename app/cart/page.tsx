import { redirect } from "next/navigation";

interface CartPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CartPage({ searchParams }: CartPageProps) {
  const params = await searchParams;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => search.append(key, v));
      } else {
        search.set(key, value);
      }
    }
  }
  const query = search.toString();
  redirect(query ? `/basket?${query}` : "/basket");
}
