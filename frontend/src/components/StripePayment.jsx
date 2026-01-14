import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function StripePayment({ clientSecret, onSuccess }) {
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
