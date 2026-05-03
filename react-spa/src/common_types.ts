export interface SchoolType {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface TripType {
    id: string;
    name: string;
    start_datetime: string;
    end_datetime: string;
    cost: number;
    school_id: string;
    school: SchoolType;
    created_at: string;
    updated_at: string;
}

export interface PaymentType {
    card_number: string;
    expiry_date: string;
    cvv: string;
}

export interface StudentType {
    id: string;
    firstname: string;
    lastname: string;
    is_new?: boolean;
}

export interface UserType {
    email: string;
    firstname: string;
    lastname: string;
}
