export interface Request {
  uuid: string;
  title: string;
  description: string;
  deliveryDate?: Date;
  userId: string;
  location: any;

  status: 'pending' | 'accepted' | 'completed';

  // Created metadata
  createdAt: Date;
  createdBy: string;

  // Accepted metadata
  acceptedAt: Date;
  acceptedBy: string;
}
