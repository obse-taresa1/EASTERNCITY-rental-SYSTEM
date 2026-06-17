import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../../components/forms/FormInput.jsx";
import FormSelect from "../../components/forms/FormSelect.jsx";
import FormTextarea from "../../components/forms/FormTextarea.jsx";
import { categories } from "../../data/items.js";

export default function ListItemPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    pricePerDay: "",
    location: "",
    description: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    alert("Listing saved for migration demo. Backend integration will be added later.");
    navigate("/lessor-dashboard");
  }

  return (
    <main className="container py-5">
      <div className="mx-auto" style={{ maxWidth: "760px" }}>
        <span className="section-label">Create Listing</span>
        <h1 className="h3 mb-4">List an Item for Rent</h1>

        <form className="dashboard-form" onSubmit={handleSubmit}>
          <FormInput
            label="Item Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Example: Toyota RAV4"
            required
          />

          <FormSelect
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Choose category"
            options={categories.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
            required
          />

          <FormInput
            label="Price Per Day"
            name="pricePerDay"
            type="number"
            value={formData.pricePerDay}
            onChange={handleChange}
            placeholder="Example: 6000"
            required
          />

          <FormInput
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Example: Addis Ababa, Ethiopia"
            required
          />

          <FormTextarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the item, condition, and rental details"
            required
          />

          <button type="submit" className="btn btn-accent-custom">
            Save Listing
          </button>
        </form>
      </div>
    </main>
  );
}