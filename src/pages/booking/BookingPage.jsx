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
  
  const [step, setStep] = useState(2); // Starts at step 2 (Booking Info)
  
  // Step 2 State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Step 3 State
  const [agreed, setAgreed] = useState(false);
  
  // Step 4 State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cbe');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentDetails = {
    cbe: {
      bank: 'Commercial Bank of Ethiopia (CBE)',
      name: 'EasternCities Rental',
      account: '1000123456789'
    },
    ebirr: {
      bank: 'eBirr',
      name: 'EasternCities Rental',
      account: '0911234567'
    },
    telebirr: {
      bank: 'Telebirr',
      name: 'EasternCities Rental',
      account: '0911234567'
    }
  };

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
    setStep(3);
  };

  const handleNextStep3 = () => {
    if (!agreed) return alert("You must accept the rental rules");
    setStep(4);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPaymentError('');
    if (!file) return;
    
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setPaymentError("Please upload a valid JPG or PNG image");
      return;
    }
    
    // Create local object URL for preview
    const previewUrl = URL.createObjectURL(file);
    setPaymentScreenshot(previewUrl);
  };

  const handleSubmitBooking = async () => {
    if (!paymentScreenshot) {
      setPaymentError("A payment screenshot is required to complete booking.");
      return;
    }
    
    if (!user || !user.id) {
      setPaymentError("You must be logged in to complete a booking.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    setPaymentError('');

    try {
      await createBooking({
        userId: user.id,
        itemId: item.id,
        itemTitle: item.title,
        owner: item.ownerName || 'Verified Owner',
        startDate,
        endDate,
        paymentMethod: selectedPaymentMethod,
        totalPrice: totalAmount,
        status: 'awaiting_verification', // Booking lifecycle
        paymentScreenshotUrl: paymentScreenshot,
        createdAt: new Date().toISOString()
      });
      
      // Redirect securely to MyBookingsPage
      navigate('/my-bookings', { state: { successMessage: "Payment submitted successfully. Your booking has been added to My Bookings and is awaiting verification." }});
    } catch (error) {
      console.error(error);
      setPaymentError(error.message || "Failed to submit booking. Please try again.");
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
            {[2, 3, 4].map(num => (
              <div key={num} className="d-flex flex-column align-items-center position-relative" style={{zIndex: 1}}>
                <div className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold mb-2`} style={{width: '28px', height: '28px', background: step >= num ? 'var(--motorx-red)' : 'var(--border)'}}>
                  {num - 1}
                </div>
                <span className="small text-muted fw-bold">{num === 2 ? 'Dates' : num === 3 ? 'Rules' : 'Payment'}</span>
              </div>
            ))}
          </div>

          {/* Step 2: Booking Information */}
          {step === 2 && (
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

          {/* Step 3: Booking Confirmation */}
          {step === 3 && (
            <div className="booking-flow-step animate__animated animate__fadeIn">
              <div className="bg-light p-4 rounded-3 border">
                <h4 className="fw-bold mb-3"><i className="bi bi-shield-exclamation text-warning"></i> Rental Agreement</h4>
                <ul className="text-muted">
                  <li className="mb-2">Item must be returned by the end date.</li>
                  <li className="mb-2">Any damages caused during rental will be charged to the renter.</li>
                  <li>Late returns incur a 50% daily fee penalty.</li>
                </ul>
              </div>

              <label className="d-flex align-items-start gap-3 p-3 border rounded-3 cursor-pointer mt-3 bg-light">
                <input type="checkbox" className="form-check-input mt-1" style={{transform: 'scale(1.2)'}} checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                <span className="fw-medium">I have read and agree to the EasternCities Rental Rules and Terms of Service.</span>
              </label>

              <div className="d-flex gap-3 mt-4">
                <button className="btn btn-outline-secondary w-50 rounded-pill fw-bold" onClick={() => setStep(2)}>Back</button>
                <button className="btn btn-danger w-50 rounded-pill fw-bold" onClick={handleNextStep3} disabled={!agreed}>Agree & Continue</button>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <div className="booking-flow-step animate__animated animate__fadeIn">
              <div className="text-center mb-4">
                <h3 className="fw-bold text-danger">Amount Due: ETB {totalAmount.toLocaleString()}</h3>
                <p className="text-muted">Select your preferred payment method and transfer the amount.</p>
              </div>

              <div className="d-flex gap-2 mb-4 justify-content-center">
                <button 
                  className={`btn ${selectedPaymentMethod === 'cbe' ? 'btn-danger' : 'btn-outline-secondary'} flex-fill fw-bold rounded-pill`}
                  onClick={() => setSelectedPaymentMethod('cbe')}
                >
                  CBE
                </button>
                <button 
                  className={`btn ${selectedPaymentMethod === 'ebirr' ? 'btn-danger' : 'btn-outline-secondary'} flex-fill fw-bold rounded-pill`}
                  onClick={() => setSelectedPaymentMethod('ebirr')}
                >
                  eBirr
                </button>
                <button 
                  className={`btn ${selectedPaymentMethod === 'telebirr' ? 'btn-danger' : 'btn-outline-secondary'} flex-fill fw-bold rounded-pill`}
                  onClick={() => setSelectedPaymentMethod('telebirr')}
                >
                  Telebirr
                </button>
              </div>

              <div className="bg-light p-4 rounded-3 border mb-4 text-center">
                <h5 className="fw-bold mb-3">Transfer Details</h5>
                <p className="mb-1 text-muted">Bank/Wallet: <strong className="text-dark">{paymentDetails[selectedPaymentMethod].bank}</strong></p>
                <p className="mb-1 text-muted">Account Name: <strong className="text-dark">{paymentDetails[selectedPaymentMethod].name}</strong></p>
                <p className="mb-0 text-muted fs-5">Account Number: <strong className="text-danger">{paymentDetails[selectedPaymentMethod].account}</strong></p>
              </div>

              <label className="payment-upload-zone w-100 position-relative">
                <input type="file" className="d-none" accept="image/jpeg, image/png, image/jpg" onChange={handleFileChange} />
                {paymentScreenshot ? (
                  <div className="position-relative">
                    <img src={paymentScreenshot} alt="Receipt Preview" className="img-fluid rounded-3 border" style={{maxHeight: '200px'}} />
                    <div className="mt-3 text-primary fw-bold"><i className="bi bi-image"></i> Click to change screenshot</div>
                  </div>
                ) : (
                  <>
                    <i className="bi bi-cloud-arrow-up"></i>
                    <h5 className="fw-bold">Upload Payment Receipt</h5>
                    <p className="text-muted small">JPG, JPEG, or PNG up to 5MB</p>
                  </>
                )}
              </label>

              {paymentError && <div className="alert alert-danger mt-3">{paymentError}</div>}

              <div className="d-flex gap-3 mt-4">
                <button className="btn btn-outline-secondary w-50 rounded-pill fw-bold" onClick={() => setStep(3)} disabled={isSubmitting}>Back</button>
                <button className="btn btn-danger w-50 rounded-pill fw-bold" onClick={handleSubmitBooking} disabled={!paymentScreenshot || isSubmitting}>
                  {isSubmitting ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processing...</>
                  ) : (
                    <><i className="bi bi-check-circle"></i> Submit Booking</>
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
