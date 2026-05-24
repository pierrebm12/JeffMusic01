import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Image, Video, Calendar, LayoutDashboard, Plus, Trash2, Edit2, Check, X, Upload, Link, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { useAdmin } from "@/context/AdminContext";
import { resolveMediaUrl } from "@/lib/utils";
import {
  useListShows, useCreateShow, useUpdateShow, useDeleteShow,
  useListPhotos, useCreatePhoto, useUpdatePhoto, useDeletePhoto,
  useListVideos, useCreateVideo, useUpdateVideo, useDeleteVideo,
  useUploadPhoto, useUploadVideo,
  useListSections, useUpdateSection,
  useAdminLogout,
  getListShowsQueryKey, getListPhotosQueryKey, getListVideosQueryKey, getListSectionsQueryKey,
} from "@workspace/api-client-react";

export function Admin({ onLogout }) {
  const { t } = useLanguage();
  const { setIsAdmin } = useAdmin();
  const qc = useQueryClient();
  const [tab, setTab] = useState("shows");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingShow, setEditingShow] = useState(null);

  const logoutMutation = useAdminLogout({
    mutation: {
      onSuccess: () => {
        setIsAdmin(false);
        onLogout();
      },
    },
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-primary/20 px-6 py-4 flex items-center justify-between">
        <div className="text-lg font-bold tracking-widest text-primary uppercase">
          {t.admin.panel}
        </div>
        <Button
          variant="outline"
          onClick={() => logoutMutation.mutate()}
          className="border-white/20 text-white hover:bg-white/10 gap-2"
        >
          <LogOut className="w-4 h-4" />
          {t.admin.logout}
        </Button>
      </header>

      <div className="flex border-b border-white/10 px-4 sm:px-6 overflow-x-auto scrollbar-none">
        {[["shows", Calendar, t.admin.showsList], ["sections", LayoutDashboard, "Secciones"], ["photos", Image, t.admin.photos], ["videos", Video, t.admin.videos]].map(([key, Icon, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 sm:gap-2 py-3 sm:py-4 px-3 sm:px-6 text-[11px] sm:text-sm font-medium uppercase tracking-wider border-b-2 transition-all flex-shrink-0 ${
              tab === key ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-white"
            }`}
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {tab === "shows" && <ShowsTab t={t} qc={qc} onEdit={setEditingShow} onDelete={(id) => setDeleteTarget({ type: "shows", id })} />}
        {tab === "sections" && <SectionsTab t={t} qc={qc} />}
        {tab === "photos" && <MediaTab type="photos" t={t} qc={qc} onDelete={(id) => setDeleteTarget({ type: "photos", id })} />}
        {tab === "videos" && <MediaTab type="videos" t={t} qc={qc} onDelete={(id) => setDeleteTarget({ type: "videos", id })} />}
      </div>

      {editingShow && (
        <EditShowModal
          show={editingShow}
          t={t}
          onClose={() => setEditingShow(null)}
          onSaved={() => { qc.invalidateQueries({ queryKey: getListShowsQueryKey() }); setEditingShow(null); }}
        />
      )}

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-[#111] border-primary/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-400">{t.admin.confirmDelete}</DialogTitle>
            <DialogDescription className="text-gray-400 mt-2">{t.admin.confirmDeleteDesc}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-3">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-white/20 text-white">{t.admin.cancel ?? "Cancelar"}</Button>
            <DeleteConfirmButton target={deleteTarget} qc={qc} t={t} onDone={() => setDeleteTarget(null)} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DeleteConfirmButton({ target, qc, t, onDone }) {
  const deleteShow = useDeleteShow({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListShowsQueryKey() }); onDone(); } } });
  const deletePhoto = useDeletePhoto({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListPhotosQueryKey() }); onDone(); } } });
  const deleteVideo = useDeleteVideo({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListVideosQueryKey() }); onDone(); } } });

  const deleteMap = { shows: deleteShow, photos: deletePhoto, videos: deleteVideo };
  const mutation = target ? deleteMap[target.type] : null;

  const handleDelete = () => {
    if (!mutation || !target) return;
    mutation.mutate({ id: target.id });
  };

  return (
    <Button onClick={handleDelete} disabled={mutation?.isPending} className="bg-red-500 hover:bg-red-600 text-white font-bold">
      {mutation?.isPending ? "..." : t.admin.confirm}
    </Button>
  );
}

function ShowsTab({ t, qc, onEdit, onDelete }) {
  const { data: shows = [], isLoading, isError } = useListShows();
  const createShow = useCreateShow({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListShowsQueryKey() }) } });
  const updateShow = useUpdateShow({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListShowsQueryKey() }) } });

  const [form, setForm] = useState({ place: "", day: "", time: "", available: true });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.place || !form.day) return;
    createShow.mutate({ data: { place: form.place, day: form.day, time: form.time || null, available: form.available } });
    setForm({ place: "", day: "", time: "", available: true });
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6">
        <h3 className="text-primary font-bold uppercase tracking-wider mb-5 flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t.admin.addShow ?? t.shows.addShow}
        </h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{t.admin.place}</label>
            <input value={form.place} onChange={e => setForm(f => ({ ...f, place: e.target.value }))}
              className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary"
              placeholder="Ej: Bogotá" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{t.admin.day}</label>
            <input value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
              className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary"
              placeholder="Ej: 15 de Mayo" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{t.admin.time}</label>
            <input value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary"
              placeholder="Ej: 8:00 PM" />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <input type="checkbox" id="avail" checked={form.available} onChange={e => setForm(f => ({ ...f, available: e.target.checked }))}
              className="w-4 h-4 accent-yellow-500" />
            <label htmlFor="avail" className="text-sm text-gray-300">{t.admin.availableLabel}</label>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={createShow.isPending} className="bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wider">
              {createShow.isPending ? "..." : t.admin.add}
            </Button>
          </div>
        </form>
      </div>

      {isLoading ? (
        <div className="text-gray-500 text-center py-12">Cargando...</div>
      ) : isError ? (
        <div className="text-red-400 text-center py-12">Error al cargar. Verifica que el servidor esté corriendo.</div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {shows.map((show) => (
              <motion.div key={show.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-[#0d0d0d] border border-white/10 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="text-white font-semibold text-lg">{show.day} — {show.place}</div>
                  {show.time && <div className="text-primary text-sm mt-1">{show.time}</div>}
                  <span className={`text-xs mt-2 inline-block px-2 py-0.5 rounded-full ${show.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {show.available ? t.shows.available : t.shows.unavailable}
                  </span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => {
                    updateShow.mutate({ id: show.id, data: { available: !show.available } });
                  }} className={`gap-1 text-xs border-white/20 ${show.available ? 'text-green-400 hover:bg-green-500/10' : 'text-gray-400 hover:bg-white/10'}`}>
                    <Check className="w-3 h-3" /> {t.admin.toggleAvail}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onEdit(show)}
                    className="gap-1 text-xs border-white/20 text-blue-400 hover:bg-blue-500/10">
                    <Edit2 className="w-3 h-3" /> {t.admin.edit}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete(show.id)}
                    className="gap-1 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-3 h-3" /> {t.admin.delete}
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {shows.length === 0 && <div className="text-gray-500 text-center py-8">{t.shows.noShows}</div>}
        </div>
      )}
    </div>
  );
}

function EditShowModal({ show, t, onClose, onSaved }) {
  const [form, setForm] = useState({ place: show.place, day: show.day, time: show.time ?? "", available: show.available });
  const updateShow = useUpdateShow({ mutation: { onSuccess: onSaved } });

  const handleSave = (e) => {
    e.preventDefault();
    updateShow.mutate({ id: show.id, data: { place: form.place, day: form.day, time: form.time || null, available: form.available } });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#111] border-primary/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">{t.admin.editShow}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 mt-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{t.admin.place}</label>
            <input value={form.place} onChange={e => setForm(f => ({ ...f, place: e.target.value }))}
              className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{t.admin.day}</label>
            <input value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
              className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{t.admin.time}</label>
            <input value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="edit-avail" checked={form.available} onChange={e => setForm(f => ({ ...f, available: e.target.checked }))}
              className="w-4 h-4 accent-yellow-500" />
            <label htmlFor="edit-avail" className="text-sm text-gray-300">{t.admin.availableLabel}</label>
          </div>
          <DialogFooter className="gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-white/20 text-white">
              <X className="w-4 h-4 mr-1" /> {t.shows.cancel}
            </Button>
            <Button type="submit" disabled={updateShow.isPending} className="bg-primary text-black hover:bg-primary/90 font-bold">
              {updateShow.isPending ? "..." : t.admin.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function SectionMediaUpload({ currentUrl, type, onUpload }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/upload/section-media/${type}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onUpload(data.url);
    } catch (err) {
      alert("Error al subir archivo: " + err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input ref={fileRef} type="file" accept={type === "video" ? "video/*" : "image/*"}
          onChange={handleFile} className="hidden" />
        <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="border-white/20 text-white hover:bg-white/10 gap-2">
          <Upload className="w-4 h-4" />
          {uploading ? "Subiendo..." : "Subir archivo"}
        </Button>
        <span className="text-xs text-gray-500">o pega una URL abajo</span>
      </div>
      {currentUrl && (
        <div className="relative">
          {type === "video" ? (
            <video src={resolveMediaUrl(currentUrl)} className="max-h-32 rounded-lg" controls />
          ) : (
            <img src={resolveMediaUrl(currentUrl)} alt="Preview" className="max-h-40 rounded-lg object-cover" />
          )}
        </div>
      )}
    </div>
  );
}

function SectionsTab({ t, qc }) {
  const { language } = useLanguage();
  const { data: sections, isLoading, isError } = useListSections();
  const updateHero = useUpdateSection({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListSectionsQueryKey() }) } });
  const updateBio = useUpdateSection({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListSectionsQueryKey() }) } });
  const updateCalendar = useUpdateSection({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListSectionsQueryKey() }) } });

  const [heroForm, setHeroForm] = useState({ mediaUrl: "", titleEs: "", titleEn: "", subtitleEs: "", subtitleEn: "" });
  const [bioForm, setBioForm] = useState({ mediaUrl: "", titleEs: "", titleEn: "", text1Es: "", text1En: "", text2Es: "", text2En: "", text3Es: "", text3En: "" });
  const [calendarForm, setCalendarForm] = useState({ mediaUrl: "", months: {} });

  const monthLabels = language === "es"
    ? ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  useEffect(() => {
    if (sections?.hero) {
      setHeroForm({
        mediaUrl: sections.hero.media_url || "",
        titleEs: sections.hero.title_es || "",
        titleEn: sections.hero.title_en || "",
        subtitleEs: sections.hero.subtitle_es || "",
        subtitleEn: sections.hero.subtitle_en || "",
      });
    }
    if (sections?.biography) {
      setBioForm({
        mediaUrl: sections.biography.media_url || "",
        titleEs: sections.biography.title_es || "",
        titleEn: sections.biography.title_en || "",
        text1Es: sections.biography.text1_es || "",
        text1En: sections.biography.text1_en || "",
        text2Es: sections.biography.text2_es || "",
        text2En: sections.biography.text2_en || "",
        text3Es: sections.biography.text3_es || "",
        text3En: sections.biography.text3_en || "",
      });
    }
    if (sections?.calendar) {
      let data = {};
      try { data = JSON.parse(sections.calendar.data_json || "{}"); } catch {}
      setCalendarForm({ mediaUrl: sections.calendar.media_url || "", months: data });
    }
  }, [sections]);

  const handleSaveHero = (e) => {
    e.preventDefault();
    updateHero.mutate({ key: "hero", data: heroForm });
  };

  const handleSaveBio = (e) => {
    e.preventDefault();
    updateBio.mutate({ key: "biography", data: bioForm });
  };

  const handleSaveCalendar = (e) => {
    e.preventDefault();
    updateCalendar.mutate({ key: "calendar", data: { mediaUrl: calendarForm.mediaUrl, dataJson: calendarForm.months } });
  };

  if (isLoading) return <div className="text-gray-500 text-center py-12">Cargando...</div>;
  if (isError) return <div className="text-red-400 text-center py-12">Error al cargar secciones. Verifica que el servidor esté corriendo.</div>;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6">
        <h3 className="text-primary font-bold uppercase tracking-wider mb-5 flex items-center gap-2">
          <Video className="w-4 h-4" /> Hero
        </h3>
        <form onSubmit={handleSaveHero} className="space-y-4">
          <SectionMediaUpload currentUrl={heroForm.mediaUrl} type="video"
            onUpload={(url) => setHeroForm(f => ({ ...f, mediaUrl: url }))} />
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Video URL</label>
            <input value={heroForm.mediaUrl} onChange={e => setHeroForm(f => ({ ...f, mediaUrl: e.target.value }))}
              className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary font-mono text-sm"
              placeholder="https://..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Título (ES)</label>
              <input value={heroForm.titleEs} onChange={e => setHeroForm(f => ({ ...f, titleEs: e.target.value }))}
                className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Title (EN)</label>
              <input value={heroForm.titleEn} onChange={e => setHeroForm(f => ({ ...f, titleEn: e.target.value }))}
                className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Subtítulo (ES)</label>
              <input value={heroForm.subtitleEs} onChange={e => setHeroForm(f => ({ ...f, subtitleEs: e.target.value }))}
                className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Subtitle (EN)</label>
              <input value={heroForm.subtitleEn} onChange={e => setHeroForm(f => ({ ...f, subtitleEn: e.target.value }))}
                className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary" />
            </div>
          </div>
          <Button type="submit" disabled={updateHero.isPending}
            className="bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wider">
            {updateHero.isPending ? "..." : t.admin.save}
          </Button>
        </form>
      </div>

      {/* Biography Section */}
      <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6">
        <h3 className="text-primary font-bold uppercase tracking-wider mb-5 flex items-center gap-2">
          <Image className="w-4 h-4" /> Biografía
        </h3>
        <form onSubmit={handleSaveBio} className="space-y-4">
          <SectionMediaUpload currentUrl={bioForm.mediaUrl} type="photo"
            onUpload={(url) => setBioForm(f => ({ ...f, mediaUrl: url }))} />
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Imagen URL</label>
            <input value={bioForm.mediaUrl} onChange={e => setBioForm(f => ({ ...f, mediaUrl: e.target.value }))}
              className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary font-mono text-sm"
              placeholder="https://..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Título (ES)</label>
              <input value={bioForm.titleEs} onChange={e => setBioForm(f => ({ ...f, titleEs: e.target.value }))}
                className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Title (EN)</label>
              <input value={bioForm.titleEn} onChange={e => setBioForm(f => ({ ...f, titleEn: e.target.value }))}
                className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Texto 1 (ES)</label>
              <textarea rows={3} value={bioForm.text1Es} onChange={e => setBioForm(f => ({ ...f, text1Es: e.target.value }))}
                className="w-full bg-transparent border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary resize-none text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Text 1 (EN)</label>
              <textarea rows={3} value={bioForm.text1En} onChange={e => setBioForm(f => ({ ...f, text1En: e.target.value }))}
                className="w-full bg-transparent border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary resize-none text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Texto 2 (ES)</label>
              <textarea rows={3} value={bioForm.text2Es} onChange={e => setBioForm(f => ({ ...f, text2Es: e.target.value }))}
                className="w-full bg-transparent border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary resize-none text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Text 2 (EN)</label>
              <textarea rows={3} value={bioForm.text2En} onChange={e => setBioForm(f => ({ ...f, text2En: e.target.value }))}
                className="w-full bg-transparent border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary resize-none text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Texto 3 / Cita (ES)</label>
              <textarea rows={3} value={bioForm.text3Es} onChange={e => setBioForm(f => ({ ...f, text3Es: e.target.value }))}
                className="w-full bg-transparent border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary resize-none text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Text 3 / Quote (EN)</label>
              <textarea rows={3} value={bioForm.text3En} onChange={e => setBioForm(f => ({ ...f, text3En: e.target.value }))}
                className="w-full bg-transparent border border-white/20 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary resize-none text-sm" />
            </div>
          </div>
          <Button type="submit" disabled={updateBio.isPending}
            className="bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wider">
            {updateBio.isPending ? "..." : t.admin.save}
          </Button>
        </form>
      </div>

      {/* Calendar Section */}
      <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6">
        <h3 className="text-primary font-bold uppercase tracking-wider mb-5 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Calendario
        </h3>
        <form onSubmit={handleSaveCalendar} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
              {language === "es" ? "Imagen de fondo general (por defecto)" : "Default background image"}
            </label>
            <SectionMediaUpload currentUrl={calendarForm.mediaUrl} type="photo"
              onUpload={(url) => setCalendarForm(f => ({ ...f, mediaUrl: url }))} />
            <div className="mt-2">
              <input value={calendarForm.mediaUrl} onChange={e => setCalendarForm(f => ({ ...f, mediaUrl: e.target.value }))}
                className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary font-mono text-sm"
                placeholder="https://..." />
            </div>
          </div>

          <div className="border-t border-white/10 pt-5">
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-3 block font-semibold">
              {language === "es" ? "Fondos por mes" : "Backgrounds per month"}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {monthLabels.map((label, idx) => (
                <div key={idx} className="bg-black/40 border border-white/5 rounded-xl p-3 space-y-2">
                  <label className="text-[10px] text-primary uppercase tracking-wider font-semibold block">{label}</label>
                  {calendarForm.months[idx] && (
                    <img src={resolveMediaUrl(calendarForm.months[idx])} alt={label}
                      className="w-full h-16 object-cover rounded-lg border border-white/5" />
                  )}
                  <input value={calendarForm.months[idx] || ""}
                    onChange={e => setCalendarForm(f => ({ ...f, months: { ...f.months, [idx]: e.target.value } }))}
                    className="w-full bg-transparent border-b border-white/20 py-1 text-white focus:outline-none focus:border-primary font-mono text-[10px]"
                    placeholder="https://..." />
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={updateCalendar.isPending}
            className="bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wider">
            {updateCalendar.isPending ? "..." : t.admin.save}
          </Button>
        </form>
      </div>
    </div>
  );
}

function MediaTab({ type, t, qc, onDelete }) {
  const isPhoto = type === "photos";
  const { data: items = [], isLoading, isError } = isPhoto ? useListPhotos() : useListVideos();
  const createPhoto = useCreatePhoto({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListPhotosQueryKey() }) } });
  const createVideo = useCreateVideo({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListVideosQueryKey() }) } });
  const uploadPhoto = useUploadPhoto({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListPhotosQueryKey() }) } });
  const uploadVideo = useUploadVideo({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListVideosQueryKey() }) } });
  const updatePhoto = useUpdatePhoto({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListPhotosQueryKey() }) } });
  const updateVideo = useUpdateVideo({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListVideosQueryKey() }) } });
  const updateVideoGallery = useUpdateSection({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListSectionsQueryKey() }) } });
  const { data: sections } = useListSections();

  const [form, setForm] = useState({ url: "", title: "", titleEn: "", sortOrder: 0 });
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ url: "", title: "", titleEn: "", sortOrder: 0 });
  const [uploadMode, setUploadMode] = useState("file");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({ title: "", titleEn: "", sortOrder: 0 });
  const [videoAdvanceSec, setVideoAdvanceSec] = useState(8);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isPhoto && sections?.videos_gallery?.data_json) {
      try {
        const d = JSON.parse(sections.videos_gallery.data_json);
        if (d?.autoAdvanceMs) setVideoAdvanceSec(d.autoAdvanceMs / 1000);
      } catch {}
    }
  }, [sections, isPhoto]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.url || !form.title) return;
    const data = { url: form.url, title: form.title, titleEn: form.titleEn || null, sortOrder: Number(form.sortOrder) };
    if (isPhoto) createPhoto.mutate({ data });
    else createVideo.mutate({ data });
    setForm({ url: "", title: "", titleEn: "", sortOrder: 0 });
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    if (!selectedFile || !uploadForm.title) return;
    const uploadData = {
      file: selectedFile,
      title: uploadForm.title,
      titleEn: uploadForm.titleEn || null,
      sortOrder: Number(uploadForm.sortOrder),
    };
    if (isPhoto) uploadPhoto.mutate(uploadData);
    else uploadVideo.mutate(uploadData);
    setSelectedFile(null);
    setUploadForm({ title: "", titleEn: "", sortOrder: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setEditForm({ url: item.url, title: item.title, titleEn: item.titleEn ?? "", sortOrder: item.sortOrder });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingItem) return;
    const data = { url: editForm.url, title: editForm.title, titleEn: editForm.titleEn || null, sortOrder: Number(editForm.sortOrder) };
    if (isPhoto) updatePhoto.mutate({ id: editingItem.id, data });
    else updateVideo.mutate({ id: editingItem.id, data });
    setEditingItem(null);
  };

  const addLabel = isPhoto ? t.admin.addPhoto : t.admin.addVideo;
  const isUploading = uploadPhoto.isPending || uploadVideo.isPending;
  const isCreating = createPhoto.isPending || createVideo.isPending;

  return (
    <div className="space-y-8">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-primary font-bold uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4" /> {addLabel}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setUploadMode("file")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                uploadMode === "file" ? "bg-primary/20 text-primary border border-primary/30" : "text-gray-500 hover:text-white"
              }`}
            >
              <Upload className="w-3 h-3" /> {t.admin.uploadFile ?? "Subir"}
            </button>
            <button
              onClick={() => setUploadMode("url")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                uploadMode === "url" ? "bg-primary/20 text-primary border border-primary/30" : "text-gray-500 hover:text-white"
              }`}
            >
              <Link className="w-3 h-3" /> URL
            </button>
          </div>
        </div>

        {uploadMode === "file" ? (
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-primary/30 transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={isPhoto ? "image/*" : "video/*"}
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="hidden"
              />
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="text-primary font-medium">{selectedFile.name}</div>
                  <div className="text-gray-500 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  {isPhoto && (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="max-h-40 mx-auto rounded-lg"
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-gray-500 mx-auto" />
                  <div className="text-gray-400 text-sm">
                    {isPhoto ? "Arrastra una imagen o haz clic para seleccionar" : "Arrastra un video o haz clic para seleccionar"}
                  </div>
                  <div className="text-gray-600 text-xs">
                    {isPhoto ? "JPEG, PNG, WebP, GIF (max 100MB)" : "MP4, MOV, AVI, WebM (max 100MB)"}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{t.admin.titleEs}</label>
                <input value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="Título en español" required />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{t.admin.titleEn}</label>
                <input value={uploadForm.titleEn} onChange={e => setUploadForm(f => ({ ...f, titleEn: e.target.value }))}
                  className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary"
                  placeholder="Title in English" />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{t.admin.orderLabel}</label>
                <input type="number" value={uploadForm.sortOrder} onChange={e => setUploadForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                  className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary" />
              </div>
            </div>

            <Button type="submit" disabled={isUploading || !selectedFile}
              className="bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wider">
              {isUploading ? "..." : t.admin.upload ?? "Subir archivo"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{t.admin.urlLabel}</label>
              <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary"
                placeholder="https://..." required />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{t.admin.titleEs}</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary"
                placeholder="Título en español" required />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{t.admin.titleEn}</label>
              <input value={form.titleEn} onChange={e => setForm(f => ({ ...f, titleEn: e.target.value }))}
                className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary"
                placeholder="Title in English" />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{t.admin.orderLabel}</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={isCreating}
                className="bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wider">
                {isCreating ? "..." : t.admin.add}
              </Button>
            </div>
          </form>
        )}
      </div>

      {isLoading ? (
        <div className="text-gray-500 text-center py-12">Cargando...</div>
      ) : isError ? (
        <div className="text-red-400 text-center py-12">Error al cargar. Verifica que el servidor esté corriendo.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-[#0d0d0d] border border-white/10 rounded-xl overflow-hidden">
                {isPhoto ? (
                  <img src={resolveMediaUrl(item.url)} alt={item.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-black/50 flex items-center justify-center">
                    <Video className="w-10 h-10 text-primary/40" />
                  </div>
                )}
                <div className="p-4">
                  <div className="text-white font-semibold">{item.title}</div>
                  {item.titleEn && <div className="text-gray-400 text-sm">{item.titleEn}</div>}
                  <div className="text-xs text-gray-600 mt-1">#{item.sortOrder}</div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => startEdit(item)}
                      className="gap-1 text-xs border-white/20 text-blue-400 hover:bg-blue-500/10 flex-1">
                      <Edit2 className="w-3 h-3" /> {t.admin.edit}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDelete(item.id)}
                      className="gap-1 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 flex-1">
                      <Trash2 className="w-3 h-3" /> {t.admin.delete}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {items.length === 0 && <div className="text-gray-500 text-center py-8 col-span-2">Sin elementos</div>}
        </div>
      )}

      {/* Video gallery settings */}
      {!isPhoto && (
        <div className="mt-8 p-5 bg-[#0d0d0d] border border-white/10 rounded-xl">
          <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4" /> Video Gallery Settings
          </h3>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
                Auto-advance (seconds)
              </label>
              <input type="number" min={2} max={60} value={videoAdvanceSec}
                onChange={e => setVideoAdvanceSec(Number(e.target.value))}
                className="w-28 bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary" />
            </div>
            <Button onClick={() => {
              updateVideoGallery.mutate({ key: "videos_gallery", data: { mediaUrl: "", dataJson: JSON.stringify({ autoAdvanceMs: videoAdvanceSec * 1000 }) } });
            }} disabled={updateVideoGallery.isPending}
              className="bg-primary text-black hover:bg-primary/90 font-bold text-sm h-10">
              {updateVideoGallery.isPending ? "..." : t.admin.save}
            </Button>
          </div>
        </div>
      )}

      {editingItem && (
        <Dialog open onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="bg-[#111] border-primary/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-primary">{t.admin.edit}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{t.admin.urlLabel}</label>
                <input value={editForm.url} onChange={e => setEditForm(f => ({ ...f, url: e.target.value }))}
                  className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary" required />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{t.admin.titleEs}</label>
                <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary" required />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{t.admin.titleEn}</label>
                <input value={editForm.titleEn} onChange={e => setEditForm(f => ({ ...f, titleEn: e.target.value }))}
                  className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{t.admin.orderLabel}</label>
                <input type="number" value={editForm.sortOrder} onChange={e => setEditForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                  className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:outline-none focus:border-primary" />
              </div>
              <DialogFooter className="gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)} className="border-white/20 text-white">
                  {t.shows.cancel}
                </Button>
                <Button type="submit" disabled={updatePhoto.isPending || updateVideo.isPending}
                  className="bg-primary text-black hover:bg-primary/90 font-bold">
                  {(updatePhoto.isPending || updateVideo.isPending) ? "..." : t.admin.save}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
