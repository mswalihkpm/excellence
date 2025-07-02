export const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to localStorage", error);
  }
};

export const loadData = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error loading from localStorage", error);
    return defaultValue;
  }
};

export const studentDetailFields = [
  { id: 'class', label: 'Class', type: 'text' },
  { id: 'regNo', label: 'Registration Number', type: 'text' },
  { id: 'address', label: 'Address', type: 'textarea' },
  { id: 'dob', label: 'Date of Birth', type: 'date' },
  { id: 'houseName', label: 'House Name', type: 'text' },
  { id: 'fatherName', label: 'Father\'s Name', type: 'text' },
  { id: 'phone', label: 'Phone Number', type: 'tel' },
  { id: 'email', label: 'Email Address', type: 'email' },
];

export const initialStudentData = () => {
  const data = {};
  studentDetailFields.forEach(field => {
    data[field.id] = '';
  });
  return data;
};