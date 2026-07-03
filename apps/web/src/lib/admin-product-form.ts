export type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  price: string;
  category_id: string;
  stock: string;
  is_active: boolean;
  image?: File | null;
  remove_image?: boolean;
};

function appendIf(form: FormData, key: string, value: string | undefined) {
  const trimmed = value?.trim();
  if (trimmed) form.append(key, trimmed);
}

export function buildProductFormData(values: ProductFormValues, mode: "create" | "update"): FormData {
  const form = new FormData();
  appendIf(form, "name", values.name);
  appendIf(form, "slug", values.slug);
  appendIf(form, "description", values.description);

  const price = values.price.trim();
  if (price) form.append("price", String(Math.trunc(Number(price))));

  appendIf(form, "category_id", values.category_id);

  const stock = values.stock.trim();
  if (stock) form.append("stock", String(Math.trunc(Number(stock))));

  form.append("is_active", values.is_active ? "true" : "false");

  if (values.image) form.append("image", values.image);

  if (mode === "update" && values.remove_image) {
    form.append("remove_image", "true");
  }

  return form;
}