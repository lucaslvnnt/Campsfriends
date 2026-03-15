import React, { useState } from "react";

const reasons = [
  { value: "harassment", label: "Harcelement" },
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Comportement inapproprie" },
  { value: "fake", label: "Faux profil" }
];

const ReportModal = ({ onClose, onSubmit }) => {
  const [reason, setReason] = useState("harassment");
  const [details, setDetails] = useState("");

  const handleSubmit = () => {
    onSubmit({ reason, details });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-night">
        <h3 className="text-xl font-semibold mb-2">Signaler un utilisateur</h3>
        <p className="text-sm text-slate-600 mb-4">
          Aide-nous a garder CampFriend sur.
        </p>
        <div className="space-y-3">
          <select
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2"
          >
            {reasons.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2"
            rows={3}
            placeholder="Details (optionnel)"
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
