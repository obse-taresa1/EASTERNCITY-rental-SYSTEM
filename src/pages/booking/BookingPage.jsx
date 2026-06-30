import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItemById } from '../../services/itemService.js';
import { createBooking } from '../../services/bookingService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDailyPrice } from '../../utils/currency.js';

export default function BookingPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const item = useMemo(() => getItemById(itemId), [itemId]);
  
  const [step, setStep] = useState(1);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [agreed, setAgreed] = useState(false);
  
  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) {
    return <div className="container py-5 text-center"><h3>Item not found</h3></div>;
  }

  // Calculate pricing
  const days = startDate && endDate ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))) : 0;
  const dailyPrice = item.pricePerDay || 0;
  const subtotal = days * dailyPrice;
  const serviceFee = subtotal * 0.05; // 5% fee
  const totalAmount = subtotal + serviceFee;

  const handleNextStep2 = () => {
    if (!startDate || !endDate) return alert("Please select rental dates");
    if (new Date(startDate) > new Date(endDate)) return alert("End date must be after start date");
    setStep(2);
  };

  const handleNextStep3 = () => {
    if (!agreed) return alert("You must accept the rental rules");
    handleSubmitBooking();
  };

  const handleSubmitBooking = async () => {
    if (!user || !user.id) {
      setBookingError("You must be logged in to submit a booking request.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    setBookingError('');

    try {
      await createBooking({
        renterId: user.id,
        ownerId: item.ownerId || item.ownerName || item.owner || "owner",
        listingId: item.id,
        itemId: item.id,
        itemTitle: item.title,
        owner: item.ownerName || 'Verified Owner',
        startDate,
        endDate,
        subtotal,
        serviceFee,
        totalPrice: totalAmount,
        totalAmount,
        status: "PENDING",
        agreementAccepted: agreed,
        createdAt: new Date().toISOString()
      });
      
      window.dispatchEvent(new Event('easterncity:bookings-updated'));
    navigate('/my-bookings', { state: { successMessage: "Booking request submitted. The owner can accept or reject it. Payment for this rental is arranged directly between you and the item owner." } });
    } catch (error) {
      console.error(error);
      setBookingError(error.message || "Failed to submit booking. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="item-details-carousel-page">
      <div className="container" style={{maxWidth: '700px'}}>
        <div className="booking-modal-content mx-auto p-4 p-md-5">
          <h2 className="fw-bold mb-4">Complete Your Booking</h2>
          
          {/* Progress Indicator */}
          <div className="d-flex justify-content-between mb-5 position-relative">
            <div className="position-absolute w-100" style={{top: '12px', height: '2px', background: 'var(--border)', zIndex: 0}}></div>
            {[1, 2].map(num => (
              <div key={num} className="d-flex flex-column align-items-center position-relative" style={{zIndex: 1}}>
                <div className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold mb-2`} style={{width: '28px', height: '28px', background: step >= num ? 'var(--motorx-red)' : 'var(--border)'}}>
                  {num}
                </div>
                <span className="small text-muted fw-bold">
                  {num === 1 ? 'Dates' : 'Confirm'}
                </span>
              </div>
            ))}
          </div>

          {/* Step 1: Booking Information */}
          {step === 1 && (
            <div className="booking-flow-step animate__animated animate__fadeIn">
              <div className="booking-summary-card">
                <img src={item.image} alt={item.title} className="booking-summary-img" />
                <div>
                  <h4 className="fw-bold m-0">{item.title}</h4>
                  <p className="text-muted m-0"><i className="bi bi-geo-alt"></i> {item.location}</p>
                </div>
              </div>

              <div className="row g-3 mt-2">
                <div className="col-6">
                  <label className="fw-bold">Start Date</label>
                  <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="col-6">
                  <label className="fw-bold">End Date</label>
                  <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate || new Date().toISOString().split('T')[0]} />
                </div>
              </div>

              {days > 0 && (
                <div className="bg-light p-4 rounded-3 mt-3">
                  <h5 className="fw-bold mb-3">Price Breakdown</h5>
                  <div className="d-flex justify-content-between mb-2"><span>{formatDailyPrice(dailyPrice)} x {days} days</span><span>ETB {subtotal.toLocaleString()}</span></div>
                  <div className="d-flex justify-content-between mb-3 text-muted"><span>Service Fee (5%)</span><span>ETB {serviceFee.toLocaleString()}</span></div>
                  <hr/>
                  <div className="d-flex justify-content-between fw-bold fs-5 text-danger"><span>Total</span><span>ETB {totalAmount.toLocaleString()}</span></div>
                </div>
              )}

              <button className="btn btn-danger w-100 btn-lg mt-3 fw-bold rounded-pill" onClick={handleNextStep2}>Continue <i className="bi bi-arrow-right"></i></button>
            </div>
          )}

          {/* Step 2: Booking Request */}
          {step === 2 && (
            <div className="booking-flow-step animate__animated animate__fadeIn">
              <div className="bg-light p-4 rounded-3 border">
                <h4 className="fw-bold mb-3"><i className="bi bi-send-check text-danger"></i> Submit Booking Request</h4>
                <ul className="text-muted">
                  <li className="mb-2">Your request will be sent to the item owner.</li>
                  <li className="mb-2">The owner can accept or reject the request.</li>
                  <li>Payment for this rental is arranged directly between you and the item owner.</li>
                </ul>
              </div>

              <label className="d-flex align-items-start gap-3 p-3 border rounded-3 cursor-pointer mt-3 bg-light">
                <input type="checkbox" className="form-check-input mt-1" style={{transform: 'scale(1.2)'}} checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                <span className="fw-medium">I have read and agree to the EasternCities Rental Rules and Terms of Service.</span>
              </label>

              <div className="alert alert-info mt-3 mb-0">
                <strong>Payment Information</strong>
                <p className="mb-0">This platform does not process rental payments. Payment arrangements are made directly with the listing owner.</p>
              </div>

              {bookingError && <div className="alert alert-danger mt-3">{bookingError}</div>}

              <div className="d-flex gap-3 mt-4">
                <button className="btn btn-outline-secondary w-50 rounded-pill fw-bold" onClick={() => setStep(1)} disabled={isSubmitting}>Back</button>
                <button className="btn btn-danger w-50 rounded-pill fw-bold" onClick={handleNextStep3} disabled={!agreed || isSubmitting}>
                  {isSubmitting ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Submitting...</>
                  ) : (
                    <><i className="bi bi-send-check"></i> Submit Request</>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}



