import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function StripePayment({ clientSecret, onSuccess, billing_details }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: billing_details.name,
            address: {
              line1: billing_details.address.line1,
              city: billing_details.address.city,
              country: billing_details.address.country,
              postal_code: billing_details.address.postal_code,
            },
          },
        },
      }
    );

    if (error) {
      alert(error.message);
    } else if (paymentIntent.status === "succeeded") {
      alert("✅ Payment Successful");
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement className="form-control mb-3" />
      <button className="btn btn-success w-100">
        Pay Now
      </button>
    </form>
  );
}
