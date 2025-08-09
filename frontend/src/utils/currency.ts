function rupiah(value: number): string{
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
};

export default rupiah;