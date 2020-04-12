import {GeoFirePoint} from "geofirex/dist/point";

export interface Request {
  uuid: string;
  title: string;
  description: string;
  deliveryDate?: Date;
  userId: string;
  location: GeoFirePoint;

  status: 'pending' | 'accepted' | 'completed';

  // Created metadata
  createdAt: Date;
  createdBy: string;

  // Edited metadata
  editedAt: Date;

  // Accepted metadata
  acceptedAt: Date;
  acceptedBy: string;

  // Contact info
  name: string;
  phone: string;
  email: string;
}
