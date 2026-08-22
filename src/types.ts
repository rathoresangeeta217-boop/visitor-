export type EntryStatus = 'pending' | 'approved' | 'rejected';

export interface FormData {
  photo: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  visitorCount: string;
  whomToMeet: string;
}

export interface Entry extends FormData {
  id: string;
  type: 'customer' | 'vendor';
  timestamp: number;
  status: EntryStatus;
  remarks?: string;
}
