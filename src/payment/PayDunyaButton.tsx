// src/payment/PayDunyaButton.tsx
import axios from "axios";

export default function PayDunyaButton({ total, items }: { total: number; items: unknown[] }) {
  const pay = async () => {
    const res = await axios.post("http://localhost:4000/paydunya/init-payment", {
      amount: total,
      items,
    });

    window.location.href = res.data.url; // redirection vers PayDunya
  };

  return (
    <button
      onClick={pay}
      className="bg-green-600 text-white px-4 py-2 rounded-lg shadow"
    >
      Payer avec PayDunya
    </button>
  );
}
