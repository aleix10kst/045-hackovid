export interface Request {
  title: string;
  description: string;
  deliveryDate?: Date;
  userId: string;
  location: any;

  // Created metadata
  createdAt: Date;
  createdBy: string;

  // Accepted metadata
  acceptedAt: Date;
  acceptedBy: string;
}
