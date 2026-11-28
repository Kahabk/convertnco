import { auth } from './firebase';

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  service: string | null;
  budget: string | null;
  message: string;
  status: 'new' | 'read' | 'archived';
  created_at: string;
};

export type EnquiryInput = {
  name: string;
  email: string;
  company?: string;
  service?: string;
  budget?: string;
  message: string;
  website?: string;
};

async function readResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

export async function submitEnquiry(input: EnquiryInput) {
  const response = await fetch('/api/enquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return readResponse(response);
}

export async function listEnquiries(): Promise<Enquiry[]> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Please sign in as the administrator');

  const response = await fetch('/api/enquiries', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await readResponse(response);
  return data.enquiries ?? [];
}
