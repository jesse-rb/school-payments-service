from legacy_payments.service import LegacyPaymentProcessor

legacy_payment_processor = LegacyPaymentProcessor()


def get_legacy_payment_processor() -> LegacyPaymentProcessor:
    return legacy_payment_processor
