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

export interface TripsResponseType {
    data: TripType[];
}
