import { useEffect, useMemo, useState } from "react";
import { deleteBannerAd, fetchManagedBannerAds, updateBannerAd } from "../../services/bannerAdsApiService.js";
import { resolveAssetUrl } from "../../services/apiClient.js";
import { useRefresh } from "../../context/RefreshContext.jsx";

const emptyForm = { companyName: "", title: "", imageUrl: "", ctaLabel: "Learn more", ctaUrl: "", displayOrder: 0, startDate: "", endDate: "", isActive: true };
const dateValue = (value) => value ? String(value).slice(0, 10) : "";

export default function BannerAdsManagementPage({ scope = "admin" }) {
  const { refresh } = useRefresh();
  const [ads, setAds] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const previewUrl = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : resolveAssetUrl(form.imageUrl), [form.imageUrl, imageFile]);

  useEffect(() => () => { if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  async function load() { try { setAds(await fetchManagedBannerAds()); } catch (error) { setMessage(error.message || "Unable to load banner campaigns."); } }
  useEffect(() => { load(); }, []);

  function edit(ad) {
    setEditingId(ad.id);
    setImageFile(null);
    setForm({ companyName: ad.companyName || "", title: ad.title || "", imageUrl: ad.sourceImageUrl || ad.imageUrl || "", ctaLabel: ad.ctaLabel || "Learn more", ctaUrl: ad.ctaUrl || "", displayOrder: Number(ad.displayOrder || 0), startDate: dateValue(ad.startDate), endDate: dateValue(ad.endDate), isActive: Boolean(ad.isActive) });
    setMessage("");
  }
  function cancel() { setEditingId(""); setImageFile(null); setForm(emptyForm); }
  async function save(event) {
    event.preventDefault(); setSaving(true); setMessage("");
    try { await updateBannerAd(editingId, form, imageFile); await load(); refresh("banner-ads"); cancel(); setMessage("Banner campaign updated."); }
    catch (error) { setMessage(error.message || "Unable to update banner campaign."); }
    finally { setSaving(false); }
  }
  async function remove(id) {
    if (!window.confirm("Remove this banner campaign?")) return;
    try { await deleteBannerAd(id); await load(); refresh("banner-ads"); setMessage("Banner campaign removed."); if (editingId === id) cancel(); }
    catch (error) { setMessage(error.message || "Unable to remove banner campaign."); }
  }

  return <main className="dashboard-content banner-ads-page">
    <div className="banner-ads-heading"><div><span className="section-label">{scope === "superadmin" ? "SUPER ADMIN" : "ADMIN"}</span><h1>Banner Ads Management</h1><p>Approved paid campaigns appear here. Images are preserved without cropping on the homepage carousel.</p></div><div className="banner-ads-heading-icon"><i className="bi bi-megaphone-fill" /></div></div>
    {message && <div className="alert alert-info">{message}</div>}
    {editingId && <div className="banner-ads-layout">
      <section className="admin-table-container banner-ad-form-card"><div className="d-flex justify-content-between align-items-center mb-3"><h2 className="h5 mb-0">Edit banner campaign</h2><button className="btn btn-sm btn-outline-secondary" type="button" onClick={cancel}>Cancel</button></div>
        <form onSubmit={save} className="banner-ad-form">
          <label>Company name<input required value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} /></label>
          <label>Campaign title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
          <label>Banner image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] || null)} /><small>Recommended: 1600 × 400 px (4:1). The full image is shown without cropping.</small></label>
          <label>Or image URL<input type="url" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://..." /></label>
          <div className="banner-ad-form-row"><label>CTA label (optional)<input value={form.ctaLabel} onChange={(event) => setForm({ ...form, ctaLabel: event.target.value })} /></label><label>Destination URL<input required value={form.ctaUrl} onChange={(event) => setForm({ ...form, ctaUrl: event.target.value })} placeholder="https://client-site.com" /></label></div>
          <div className="banner-ad-form-row"><label>Start date<input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /></label><label>End date<input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} /></label><label>Display order<input min="0" type="number" value={form.displayOrder} onChange={(event) => setForm({ ...form, displayOrder: event.target.value })} /></label></div>
          <label className="banner-ad-toggle"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> Active when dates allow</label>
          <button className="btn btn-accent-custom banner-ad-submit" disabled={saving} type="submit">{saving ? "Saving..." : "Update banner"}</button>
        </form>
      </section>
      <aside className="banner-ad-preview-card"><span className="section-label">Preview</span>{previewUrl ? <img src={previewUrl} alt="Banner preview" /> : <div className="banner-ad-preview-empty">Upload an image to preview it.</div>}<p className="mb-0 mt-2">{form.companyName || "Sponsor"} · {form.title || "Campaign title"}</p></aside>
    </div>}
    <section className="admin-table-container banner-ad-list-card"><div className="d-flex justify-content-between align-items-center mb-3"><div><h2 className="h5 mb-1">Approved banner campaigns</h2><p className="text-muted small mb-0">Only active campaigns within their dates appear in the public sponsored carousel.</p></div><span className="banner-ad-count">{ads.length} total</span></div>
      <div className="banner-ad-list">{ads.map((ad) => <article className="banner-ad-list-item" key={ad.id}><img src={ad.imageUrl} alt="" /><div className="banner-ad-list-copy"><strong>{ad.companyName || ad.title}</strong><span>{ad.title}</span><small>{ad.startDate || "Now"} — {ad.endDate || "No end date"}</small></div><span className={"banner-ad-status " + (ad.isActive ? "is-active" : "is-paused")}>{ad.isActive ? "Active" : "Paused"}</span><div className="d-flex gap-2"><button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => edit(ad)}>Edit</button><button className="btn btn-sm btn-outline-danger" type="button" onClick={() => remove(ad.id)}>Remove</button></div></article>)}{!ads.length && <div className="banner-ad-empty">No approved banner campaigns yet.</div>}</div>
    </section>
  </main>;
}
