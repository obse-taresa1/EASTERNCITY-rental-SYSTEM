import { paymentMethods } from "../../services/paymentService.js";

export default function PaymentMethodSelector({ value, onChange }) {
  return (
    <div className="booking-payment-methods">
      <h3 className="h5 mb-3">Payment Method</h3>

      <div className="row g-3">
        {paymentMethods.map((method) => (
          <div className="col-md-4" key={method.id}>
            <label className="payment-option w-100">
              <input
                type="radio"
                name="paymentMethod"
                value={method.name}
                checked={value === method.name}
                onChange={(event) => onChange(event.target.value)}
                required
              />
              <span>
                <i className="bi bi-phone" />
                {method.name}
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}