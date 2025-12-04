export interface ValidationError {
  field: string;
  message: string;
}

export interface TourFormData {
  title: string;
  destination: string;
  price: string;
  startDate: string;
  duration: string;
  imageUrl: string;
}

export const validateTourForm = (data: TourFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Title validation
  if (!data.title.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (data.title.trim().length < 3) {
    errors.push({ field: 'title', message: 'Title must be at least 3 characters' });
  } else if (data.title.trim().length > 100) {
    errors.push({ field: 'title', message: 'Title cannot exceed 100 characters' });
  }

  // Destination validation
  if (!data.destination.trim()) {
    errors.push({ field: 'destination', message: 'Destination is required' });
  } else if (data.destination.trim().length < 2) {
    errors.push({ field: 'destination', message: 'Destination must be at least 2 characters' });
  } else if (data.destination.trim().length > 50) {
    errors.push({ field: 'destination', message: 'Destination cannot exceed 50 characters' });
  }

  // Price validation
  if (!data.price) {
    errors.push({ field: 'price', message: 'Price is required' });
  } else {
    const price = parseFloat(data.price);
    if (isNaN(price)) {
      errors.push({ field: 'price', message: 'Price must be a valid number' });
    } else if (price < 1) {
      errors.push({ field: 'price', message: 'Price must be at least ₹1' });
    } else if (price > 1000000) {
      errors.push({ field: 'price', message: 'Price cannot exceed ₹10,00,000' });
    }
  }

  // Start date validation
  if (!data.startDate) {
    errors.push({ field: 'startDate', message: 'Start date is required' });
  } else {
    const startDate = new Date(data.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      errors.push({ field: 'startDate', message: 'Start date must be in the future' });
    }
  }

  // Duration validation
  if (!data.duration) {
    errors.push({ field: 'duration', message: 'Duration is required' });
  } else {
    const duration = parseInt(data.duration);
    if (isNaN(duration)) {
      errors.push({ field: 'duration', message: 'Duration must be a valid number' });
    } else if (duration < 1) {
      errors.push({ field: 'duration', message: 'Duration must be at least 1 day' });
    } else if (duration > 365) {
      errors.push({ field: 'duration', message: 'Duration cannot exceed 365 days' });
    }
  }

  // Image URL validation
  if (!data.imageUrl.trim()) {
    errors.push({ field: 'imageUrl', message: 'Image is required' });
  }

  return errors;
};