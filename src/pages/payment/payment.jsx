import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiInfo,
  FiLoader,
  FiCreditCard,
} from "react-icons/fi";
import { getOrderByIdApi, payOrderApi } from "../../api/orderApi.js";
import { getBuyerWalletApi } from "../../api/walletApi.js";
import Loader from "../../components/common/Loader.jsx";
import toast from "react-hot-toast";
import "./Payment.css";

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderByIdApi(id),
  });

  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ["buyer-wallet"],
    queryFn: getBuyerWalletApi,
  });

  const { mutate: payOrder, isPending } = useMutation({
    mutationFn: () => payOrderApi(id, {}),
    onSuccess: () => {
      toast.success("Payment successful! Waiting for admin approval.");
      queryClient.invalidateQueries(["order", id]);
      queryClient.invalidateQueries(["buyer-wallet"]);
      queryClient.invalidateQueries(["buyer-orders"]);
      navigate(`/orders/${id}`);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Payment failed"),
  });

  if (orderLoading || walletLoading) return <Loader fullPage />;

  const order = orderData?.order;
  if (!order) return <div className="container">Order not found</div>;
  if (order.isPaid) {
    navigate(`/orders/${id}`);
    return null;
  }

  const balance = walletData?.balance || 0;
  const hasSufficientBalance = balance >= order.amount;

  const summaryRows = [
    ["Service",      order.gigId?.title],
    ["Package",      order.package],
    ["Delivery",     `${order.deliveryTime} days`],
    ["Platform fee", `$${(order.amount * 0.02).toFixed(2)} (2%)`],
  ];

  return (
    <div className="payment-page">
      <div className="container payment-container">

        {/* ── Order Summary ── */}
        <div className="payment-card">
          <h2 className="payment-card__title">Order Summary</h2>

          <div className="payment-summary-rows">
            {summaryRows.map(([label, val]) => (
              <div key={label} className="payment-summary-row">
                <span className="payment-summary-row__label">{label}</span>
                <span className="payment-summary-row__value">{val}</span>
              </div>
            ))}
          </div>

          <div className="payment-total">
            <span>Total</span>
            <span className="payment-total__amount">${order.amount}</span>
          </div>
        </div>

        {/* ── Wallet Payment ── */}
        <div className="payment-card">
          <div className="payment-card__header">
            <FiCreditCard size={22} className="payment-card__header-icon" />
            <h2 className="payment-card__title">Pay with Wallet</h2>
          </div>

          {/* Balance vs Required */}
          <div className={`payment-balance ${hasSufficientBalance ? "payment-balance--sufficient" : "payment-balance--insufficient"}`}>
            <div className="payment-balance__item">
              <p className="payment-balance__label">Wallet Balance</p>
              <p className={`payment-balance__amount ${hasSufficientBalance ? "payment-balance__amount--green" : "payment-balance__amount--red"}`}>
                ${balance.toFixed(2)}
              </p>
            </div>
            <div className="payment-balance__item payment-balance__item--right">
              <p className="payment-balance__label">Required</p>
              <p className="payment-balance__amount payment-balance__amount--primary">
                ${order.amount}
              </p>
            </div>

            {!hasSufficientBalance && (
              <p className="payment-balance__warning">
                <FiAlertTriangle size={14} />
                Insufficient balance! Add ${(order.amount - balance).toFixed(2)} more to your wallet.
              </p>
            )}
          </div>

          {/* Add Funds Notice */}
          {!hasSufficientBalance && (
            <div className="payment-notice">
              <FiInfo size={14} className="payment-notice__icon" />
              <span>
                Go to your dashboard and add funds to your wallet first.{" "}
                <a href="/buyer/dashboard" className="payment-notice__link">
                  Add funds to wallet <FiArrowRight size={12} />
                </a>
              </span>
            </div>
          )}

          {/* Pay Button */}
          <button
            className="btn btn-primary payment-btn"
            onClick={() => payOrder()}
            disabled={isPending || !hasSufficientBalance}
          >
            {isPending ? (
              <>
                <FiLoader className="payment-btn__spinner" size={16} />
                Processing...
              </>
            ) : (
              `Pay $${order.amount} from Wallet`
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Payment;