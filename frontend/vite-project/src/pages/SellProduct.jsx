import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import Spinner from "../components/ui/Spinner";
import { createProduct, fetchProduct, updateProduct } from "../store/slices/productSlice";
import toast from "react-hot-toast";

export default function SellProduct() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct, loading } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) dispatch(fetchProduct(id));
  }, [dispatch, id, isEdit]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    const result = isEdit
      ? await dispatch(updateProduct({ id, formData }))
      : await dispatch(createProduct(formData));
    setSubmitting(false);
    if (result.meta.requestStatus === "fulfilled") {
      toast.success(isEdit ? "Listing updated successfully! ✨" : "Listed for your hostel floor! 🎉", {
        style: { background: "#0c0d18", color: "#00ff88", border: "1px solid #00ff8840" }
      });
      navigate("/seller");
    } else {
      toast.error(result.payload || "Could not save listing");
    }
  };

  if (isEdit && loading && !currentProduct) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isEdit && currentProduct && user && currentProduct.seller?._id !== user._id) {
    return <p className="page-wrap text-stone-400">You can only edit your own listing.</p>;
  }

  return (
    <div className="page-wrap max-w-2xl py-8">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl md:text-3xl font-black text-white">
          {isEdit ? "Edit Product Listing" : "Sell on AfterGoodHours"}
        </h1>
        <p className="text-stone-400 text-xs">
          Add photos and description so your hostel floor neighbours can discover & buy quickly.
        </p>
      </div>

      <ProductForm
        initial={isEdit ? currentProduct : null}
        submitting={submitting}
        onSubmit={handleSubmit}
        submitLabel={isEdit ? "Save Changes" : "Publish Listing ⚡"}
      />
    </div>
  );
}
