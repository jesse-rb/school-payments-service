import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";
import type { TripType } from "./common_types";
import { formatDuration, formatTime } from "./util";
import type { UserType, StudentType, PaymentType } from "./common_types.ts";

function Trip() {
    const { id } = useParams();
    const { state } = useLocation();
    const [trip, setTrip] = useState<TripType>();

    // Form state
    const [user, setUser] = useState<UserType>({
        email: "",
        firstname: "",
        lastname: "",
    });
    const [selectedStudents, setSelectedStudents] = useState<StudentType[]>([]);
    const [payment, setPayment] = useState<PaymentType>({
        card_number: "",
        expiry_date: "",
        cvv: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [storedUserId, setStoredUserId] = useState<string | null>(null);
    const [storedStudentIds, setStoredStudentIds] = useState<
        Record<string, string>
    >({});

    useEffect(() => {
        if (state) {
            setTrip(state);
        } else {
            loadTrip();
        }
    }, []);

    async function loadTrip() {
        interface TripResponseType {
            data: TripType;
        }

        if (id === undefined) {
            throw new Response("Trip must have an ID");
        }
        const resp = await fetch(`/api/trips/${id}`);
        if (!resp.ok) {
            throw new Response("Failed to load trips", { status: resp.status });
        }
        const json: TripResponseType = await resp.json();
        setTrip(json.data);
    }

    // --- Student helpers ---
    function addStudent() {
        setSelectedStudents((prev) => [
            ...prev,
            {
                is_new: true,
                id: crypto.randomUUID(),
                firstname: "",
                lastname: "",
            },
        ]);
    }

    function removeStudent(studentId: string) {
        setSelectedStudents((prev) => prev.filter((s) => s.id !== studentId));
    }

    function updateStudent(
        studentId: string | null,
        field: keyof Omit<StudentType, "id">,
        value: string,
    ) {
        setSelectedStudents((prev) =>
            prev.map((s) =>
                s.id === studentId ? { ...s, [field]: value } : s,
            ),
        );
    }

    // --- Payment helpers ---
    function formatCardNumber(value: string) {
        return value.replace(/\D/g, "").slice(0, 16);
    }

    function formatExpiry(value: string) {
        const digits = value.replace(/\D/g, "").slice(0, 4);
        if (digits.length >= 3)
            return `${digits.slice(0, 2)}/${digits.slice(2)}`;
        return digits;
    }

    function formatCvv(value: string) {
        return value.replace(/\D/g, "").slice(0, 4);
    }

    // --- Submit ---
    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setError(null);

        if (
            !user.email.trim() ||
            !user.firstname.trim() ||
            !user.lastname.trim()
        ) {
            setError("Please fill in your details.");
            return;
        }

        if (selectedStudents.length === 0) {
            setError("Please add at least one student.");
            return;
        }

        const hasEmptyStudents = selectedStudents.some(
            (s) => !s.firstname.trim() || !s.lastname.trim(),
        );
        if (hasEmptyStudents) {
            setError("Please fill in all student names.");
            return;
        }

        if (!payment.card_number || !payment.expiry_date || !payment.cvv) {
            setError("Please fill in all payment details.");
            return;
        }

        const totalAmount = trip ? trip.cost * selectedStudents.length : 0;

        const payload = {
            user: {
                id: storedUserId,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
            },
            trips: [
                {
                    id: trip?.id ?? id,
                    students: selectedStudents.map(
                        ({ id, firstname, lastname, is_new }) => ({
                            id: is_new ? null : (storedStudentIds[id] ?? id),
                            firstname,
                            lastname,
                        }),
                    ),
                },
            ],
            amount: totalAmount,
            card_number: payment.card_number,
            expiry_date: payment.expiry_date,
            cvv: payment.cvv,
            activity_id: trip?.id ?? id ?? "",
        };

        try {
            setSubmitting(true);
            const resp = await fetch("/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!resp.ok) {
                const json = await resp.json();
                const message =
                    typeof json === "string"
                        ? json
                        : (json?.detail ??
                          json?.message ??
                          json?.error ??
                          "Registration failed.");
                setError(message);
                return;
            }

            const result = await resp.json();

            // Persist user_id and map local student UUIDs  server student_ids in state
            setStoredUserId(result.user_id ?? storedUserId);
            setStoredStudentIds((prev) => {
                const updated = { ...prev };
                result.students?.forEach(
                    (s: { student_id: string }, idx: number) => {
                        const localId = selectedStudents[idx]?.id;
                        if (localId) updated[localId] = s.student_id;
                    },
                );
                return updated;
            });

            setSuccess(true);
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            {trip === undefined ? (
                <span></span>
            ) : (
                <>
                    <div className="flex items-center gap-4 flex-col sm:flex-row">
                        <div className="flex flex-col items-center justify-center bg-stone-100 rounded-lg w-full sm:w-12 h-12 shrink-0">
                            <span className="text-xs font-medium text-stone-500 uppercase leading-none">
                                {new Date(
                                    trip.start_datetime,
                                ).toLocaleDateString("en-NZ", {
                                    month: "short",
                                })}
                            </span>
                            <span className="text-lg font-semibold text-stone-800 leading-none mt-0.5">
                                {new Date(trip.start_datetime).getDate()}
                            </span>
                        </div>
                        <div>
                            <p className="font-medium text-stone-800 group-hover:text-stone-600 transition-colors">
                                {trip.name}
                            </p>
                            <p className="text-sm text-stone-400 mt-0.5 flex flex-col gap-1">
                                <span>{trip.school.name}</span>
                                <span>
                                    {formatTime(trip.start_datetime)} -{" "}
                                    {formatTime(trip.end_datetime)}
                                </span>
                                <span>
                                    {formatDuration(
                                        trip.start_datetime,
                                        trip.end_datetime,
                                    )}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Right: cost */}
                    <div className="text-right shrink-0 ml-6">
                        <p className="text-sm font-semibold text-stone-700">
                            ${trip.cost.toFixed(2)}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">
                            per student
                        </p>
                    </div>

                    {/* Form */}
                    {success ? (
                        <div className="mt-8 rounded-lg bg-green-50 border border-green-200 px-5 py-4 text-sm text-green-700 font-medium">
                            Registration successful! You'll receive a
                            confirmation confirmation email shortly.
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="mt-8 space-y-8"
                        >
                            {/* Error banner */}
                            {error && (
                                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 font-medium">
                                    {error}
                                </div>
                            )}

                            {/* User details section */}
                            <section>
                                <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-3">
                                    Your Details
                                </h2>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-stone-500 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            value={user.email}
                                            onChange={(e) =>
                                                setUser((u) => ({
                                                    ...u,
                                                    email: e.target.value,
                                                }))
                                            }
                                            className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <label className="block text-xs text-stone-500 mb-1">
                                                First name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="First name"
                                                value={user.firstname}
                                                onChange={(e) =>
                                                    setUser((u) => ({
                                                        ...u,
                                                        firstname:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-stone-500 mb-1">
                                                Last name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Last name"
                                                value={user.lastname}
                                                onChange={(e) =>
                                                    setUser((u) => ({
                                                        ...u,
                                                        lastname:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Students section */}
                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">
                                        Students
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={addStudent}
                                        className="text-xs font-medium text-stone-500 hover:text-stone-800 border border-stone-200 hover:border-stone-400 rounded-md px-3 py-1.5 transition-colors"
                                    >
                                        + Add student
                                    </button>
                                </div>

                                {selectedStudents.length === 0 ? (
                                    <p className="text-sm text-stone-400 italic">
                                        No students added yet. Click "Add
                                        student" to begin.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedStudents.map(
                                            (student, idx) => (
                                                <div
                                                    key={student.id}
                                                    className="flex items-center gap-3"
                                                >
                                                    <span className="text-xs text-stone-400 w-5 text-right shrink-0">
                                                        {idx + 1}.
                                                    </span>
                                                    <input
                                                        type="text"
                                                        placeholder="First name"
                                                        value={
                                                            student.firstname
                                                        }
                                                        onChange={(e) =>
                                                            updateStudent(
                                                                student.id,
                                                                "firstname",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="flex-1 min-w-0 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Last name"
                                                        value={student.lastname}
                                                        onChange={(e) =>
                                                            updateStudent(
                                                                student.id,
                                                                "lastname",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="flex-1 min-w-0 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeStudent(
                                                                student.id,
                                                            )
                                                        }
                                                        className="shrink-0 text-stone-300 hover:text-red-400 transition-colors text-lg leading-none"
                                                        aria-label="Remove student"
                                                    >
                                                        x
                                                    </button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </section>

                            {/* Payment section */}
                            <section>
                                <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-3">
                                    Payment
                                </h2>
                                <div className="space-y-3">
                                    {/* Card number */}
                                    <div>
                                        <label className="block text-xs text-stone-500 mb-1">
                                            Card number
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="1234 5678 9012 3456"
                                            value={payment.card_number.replace(
                                                /(\d{4})(?=\d)/g,
                                                "$1 ",
                                            )}
                                            onChange={(e) =>
                                                setPayment((p) => ({
                                                    ...p,
                                                    card_number:
                                                        formatCardNumber(
                                                            e.target.value,
                                                        ),
                                                }))
                                            }
                                            className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition tracking-widest"
                                        />
                                    </div>

                                    {/* Expiry + CVV */}
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <label className="block text-xs text-stone-500 mb-1">
                                                Expiry (MM/YY)
                                            </label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="MM/YY"
                                                value={payment.expiry_date}
                                                onChange={(e) =>
                                                    setPayment((p) => ({
                                                        ...p,
                                                        expiry_date:
                                                            formatExpiry(
                                                                e.target.value,
                                                            ),
                                                    }))
                                                }
                                                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition"
                                            />
                                        </div>
                                        <div className="w-28">
                                            <label className="block text-xs text-stone-500 mb-1">
                                                CVV
                                            </label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="123"
                                                value={payment.cvv}
                                                onChange={(e) =>
                                                    setPayment((p) => ({
                                                        ...p,
                                                        cvv: formatCvv(
                                                            e.target.value,
                                                        ),
                                                    }))
                                                }
                                                className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Total + submit */}
                            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                                <div>
                                    <p className="text-xs text-stone-400">
                                        Total
                                    </p>
                                    <p className="text-base font-semibold text-stone-800">
                                        $
                                        {(
                                            trip.cost *
                                            (selectedStudents.length || 0)
                                        ).toFixed(2)}
                                        {selectedStudents.length > 0 && (
                                            <span className="text-xs font-normal text-stone-400 ml-1.5">
                                                ({selectedStudents.length}{" "}
                                                student
                                                {selectedStudents.length !== 1
                                                    ? "s"
                                                    : ""}
                                                )
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-lg bg-stone-800 hover:bg-stone-700 disabled:bg-stone-300 text-white text-sm font-medium px-6 py-2.5 transition-colors"
                                >
                                    {submitting
                                        ? "Processing."
                                        : "Register & Pay"}
                                </button>
                            </div>
                        </form>
                    )}
                </>
            )}
        </>
    );
}

export default Trip;
