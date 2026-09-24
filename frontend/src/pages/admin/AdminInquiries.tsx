import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Inbox, Loader2, Phone, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError } from "@/lib/api";
import { adminInquiries, adminUpdateInquiry, type AdminInquiry, type InquiryStatus } from "@/lib/admin";
import { categoryName } from "@/lib/data";

const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "Mới nhận", contacted: "Đã liên hệ", closed: "Đã xử lý",
};
const STATUS_COLORS: Record<InquiryStatus, string> = {
  new: "border-clay/30 bg-clay/5 text-clay", contacted: "border-royal/30 bg-royal/5 text-royal", closed: "border-line bg-panel text-ink-soft",
};
const dateFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });

function InquiryRow({ inquiry, busy, onStatus }: { inquiry: AdminInquiry; busy: boolean; onStatus: (id: string, status: InquiryStatus) => void }) {
  const { id, full_name, phone, email, category_interest, message, created_at, updated_at, status } = inquiry;
  return (
    <article data-testid={`inquiry-row-${id}`} className="grid gap-5 border-b border-line p-5 last:border-0 sm:p-6 lg:grid-cols-[1fr_1.5fr_190px] lg:gap-8">
      <div className="min-w-0">
        <h2 data-testid={`inquiry-name-${id}`} className="break-words font-heading text-base text-ink">{full_name}</h2>
        <a data-testid={`inquiry-call-${id}`} href={`tel:${phone.replace(/[^+\d]/g, "")}`} aria-label={`Gọi ${full_name}: ${phone}`} className="mt-3 inline-flex items-center gap-2 rounded-full bg-royal px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-royal-deep">
          <Phone className="h-4 w-4" /> {phone}
        </a>
        {email && <a data-testid={`inquiry-email-${id}`} href={`mailto:${email}`} className="mt-3 block break-all text-sm text-ink-soft transition-colors hover:text-royal">{email}</a>}
        <time dateTime={created_at} data-testid={`inquiry-date-${id}`} className="mt-3 block text-xs text-ink-soft">Nhận lúc {dateFormat.format(new Date(created_at))}</time>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Nhu cầu tư vấn</p>
        <p data-testid={`inquiry-interest-${id}`} className="mt-2 text-sm font-semibold text-ink">{category_interest ? categoryName(category_interest) : "Chưa chọn danh mục"}</p>
        <p data-testid={`inquiry-message-${id}`} className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-soft [overflow-wrap:anywhere]">{message || "Khách chưa để lại nội dung."}</p>
      </div>
      <div>
        <label htmlFor={`status-${id}`} className="mb-2 block text-xs font-semibold text-ink-soft">Trạng thái xử lý</label>
        <Select value={status} disabled={busy} onValueChange={(value) => onStatus(id, value as InquiryStatus)}>
          <SelectTrigger id={`status-${id}`} aria-label={`Trạng thái của ${full_name}`} data-testid={`inquiry-status-${id}`} className={`min-h-10 w-full rounded-xl ${STATUS_COLORS[status]}`}>
            <SelectValue>{(value) => STATUS_LABELS[value as InquiryStatus]}</SelectValue>
          </SelectTrigger>
          <SelectContent data-testid={`inquiry-status-menu-${id}`}>
            {Object.entries(STATUS_LABELS).map(([value, label]) => <SelectItem key={value} value={value} data-testid={`inquiry-status-${id}-${value}`}>{label}</SelectItem>)}
          </SelectContent>
        </Select>
        {updated_at && <p data-testid={`inquiry-updated-${id}`} className="mt-2 text-xs leading-relaxed text-ink-soft">Cập nhật {dateFormat.format(new Date(updated_at))}</p>}
      </div>
    </article>
  );
}

export default function AdminInquiries() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["admin-inquiries", search, status, page],
    queryFn: () => adminInquiries(search, status, page),
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: InquiryStatus }) => adminUpdateInquiry(id, value),
    onSuccess: async () => {
      if (status !== "all" && query.data?.items.length === 1 && page > 1) setPage(page - 1);
      await queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
      toast.success("Đã cập nhật trạng thái tư vấn");
    },
    onError: (error) => toast.error(error.message || "Chưa lưu được trạng thái. Vui lòng thử lại."),
  });
  const authError = [query.error, mutation.error].some((error) => error instanceof ApiError && error.status === 401);
  useEffect(() => {
    if (authError) {
      queryClient.removeQueries({ queryKey: ["admin-inquiries"] });
      navigate("/admin/login", { replace: true });
    }
  }, [authError, navigate, queryClient]);
  const pages = Math.max(1, Math.ceil((query.data?.total ?? 0) / 20));

  return (
    <section data-testid="admin-inquiries-page">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Chăm sóc khách hàng</p>
          <h1 data-testid="inquiries-heading" className="mt-3 font-heading text-4xl tracking-tight text-ink">Yêu cầu tư vấn</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">Khách đã để lại thông tin tại trang Liên hệ. Gọi lại để tư vấn và cập nhật trạng thái sau mỗi cuộc gọi.</p>
        </div>
        <Button variant="outline" data-testid="inquiries-refresh" disabled={query.isFetching || mutation.isPending} onClick={() => void query.refetch()} className="h-11 rounded-full bg-card px-5 transition-colors">
          <RefreshCw className={query.isFetching ? "animate-spin" : ""} /> Làm mới
        </Button>
      </div>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end">
        <form className="flex flex-1 gap-2" onSubmit={(event) => { event.preventDefault(); setSearch(draft.trim()); setPage(1); }} data-testid="inquiries-search-form">
          <div className="flex-1">
            <label htmlFor="inquiry-search" className="mb-2 block text-xs font-semibold text-ink-soft">Tìm khách hàng</label>
            <Input id="inquiry-search" data-testid="inquiries-search" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={120} placeholder="Tên, số điện thoại, email hoặc nội dung…" className="h-11 rounded-xl border-line bg-card" />
          </div>
          <Button type="submit" data-testid="inquiries-search-submit" aria-label="Tìm yêu cầu" className="mt-auto h-11 rounded-xl px-4 transition-colors"><Search /></Button>
        </form>
        <div className="sm:w-52">
          <label htmlFor="inquiries-filter" className="mb-2 block text-xs font-semibold text-ink-soft">Lọc theo trạng thái</label>
          <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
            <SelectTrigger id="inquiries-filter" data-testid="inquiries-filter" className="min-h-11 w-full rounded-xl border-line bg-card">
              <SelectValue>{(value) => value === "all" ? "Tất cả trạng thái" : STATUS_LABELS[value as InquiryStatus]}</SelectValue>
            </SelectTrigger>
            <SelectContent data-testid="inquiries-filter-menu">
              <SelectItem value="all" data-testid="inquiries-filter-all">Tất cả trạng thái</SelectItem>
              {Object.entries(STATUS_LABELS).map(([value, label]) => <SelectItem key={value} value={value} data-testid={`inquiries-filter-${value}`}>{label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      {mutation.isError && <p role="alert" data-testid="inquiries-update-error" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{mutation.error.message}</p>}
      <div className="mt-6 overflow-hidden rounded-3xl border border-line bg-card" data-testid="inquiries-list" aria-busy={query.isFetching}>
        {query.isPending ? <p data-testid="inquiries-loading" role="status" className="flex items-center gap-3 p-8 text-sm text-ink-soft"><Loader2 className="h-5 w-5 animate-spin" /> Đang tải yêu cầu tư vấn…</p>
          : query.isError ? <div role="alert" data-testid="inquiries-load-error" className="p-8"><p className="text-sm text-clay">Không tải được danh sách. Thông tin khách hàng vẫn được lưu.</p><Button variant="outline" data-testid="inquiries-retry" onClick={() => void query.refetch()} className="mt-4 transition-colors">Thử lại</Button></div>
          : query.data.items.length === 0 ? <div data-testid="inquiries-empty" className="p-8 sm:p-12"><Inbox className="h-8 w-8 text-royal" /><h2 className="mt-4 font-heading text-lg text-ink">{search || status !== "all" ? "Không tìm thấy yêu cầu phù hợp" : "Chưa có yêu cầu tư vấn"}</h2><p className="mt-2 text-sm text-ink-soft">{search || status !== "all" ? "Thử thay đổi từ khoá hoặc chọn tất cả trạng thái." : "Khi khách gửi form Liên hệ, thông tin sẽ xuất hiện tại đây."}</p></div>
          : query.data.items.map((inquiry) => <InquiryRow key={inquiry.id} inquiry={inquiry} busy={mutation.isPending} onStatus={(id, value) => mutation.mutate({ id, value })} />)}
      </div>
      {query.isSuccess && <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <p data-testid="inquiries-total" role="status" className="text-sm text-ink-soft">{query.data.total} yêu cầu{search || status !== "all" ? " phù hợp" : " tư vấn"}</p>
        <div className="flex items-center gap-3">
          <Button variant="outline" aria-label="Trang trước" data-testid="inquiries-prev" disabled={page === 1 || query.isFetching} onClick={() => setPage(page - 1)} className="h-10 bg-card transition-colors"><ChevronLeft /></Button>
          <span data-testid="inquiries-pagination" className="text-sm text-ink-soft">Trang {page} / {pages}</span>
          <Button variant="outline" aria-label="Trang sau" data-testid="inquiries-next" disabled={page >= pages || query.isFetching} onClick={() => setPage(page + 1)} className="h-10 bg-card transition-colors"><ChevronRight /></Button>
        </div>
      </div>}
    </section>
  );
}
