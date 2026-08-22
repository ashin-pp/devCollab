import type { AdminSalesReportItemDto } from "../../application/dtos/admin/response/admin-sales-report.response.dto";

const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;

const formatMoney = (amount: number, currency: string) => {
    const symbol = currency === "INR" ? "Rs " : currency === "USD" ? "$" : `${currency} `;
    const value = Number(amount);
    if (!Number.isFinite(value)) return `${symbol}0`;
    return `${symbol}${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
};

const escapePdf = (value: string) =>
    value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

export function buildAdminSalesReportPdf(input: {
    items: AdminSalesReportItemDto[];
    summary: {
        totalRevenue: number;
        successCount: number;
        failedCount: number;
        cancelledCount: number;
        currency: string;
    };
    filters: { status: string; planName: string; from: string; to: string };
}): Promise<Buffer> {
    const header = [
        "DevCollab Sales Report",
        `Generated: ${new Date().toISOString()}  Rows: ${input.items.length}`,
        `Filters: status=${input.filters.status} plan=${input.filters.planName} from=${input.filters.from} to=${input.filters.to}`,
        `Revenue ${formatMoney(input.summary.totalRevenue, input.summary.currency)}  Success ${input.summary.successCount}  Failed ${input.summary.failedCount}  Cancelled ${input.summary.cancelledCount}`,
        "",
        "Date                 User                          Plan                Amount        Status      Order",
        "----------------------------------------------------------------------------------------------------",
    ];

    const rows = input.items.map((item) => {
        const date = new Date(item.createdAt).toISOString().replace("T", " ").slice(0, 16);
        const user = (item.userName || item.userEmail || item.userId || "Unknown").slice(0, 28).padEnd(28);
        const plan = item.planName.slice(0, 18).padEnd(18);
        const amount = formatMoney(item.amount, item.currency).padEnd(12);
        const status = item.status.padEnd(10);
        const order = item.razorpayOrderId.slice(0, 28);
        return `${date}  ${user}  ${plan}  ${amount}  ${status}  ${order}`;
    });

    const lines = [...header, ...rows];
    const linesPerPage = 42;
    const pages: string[][] = [];
    for (let i = 0; i < lines.length; i += linesPerPage) {
        pages.push(lines.slice(i, i + linesPerPage));
    }
    if (pages.length === 0) pages.push(header);

    const objects: string[] = [];
    const add = (content: string) => {
        objects.push(content);
        return objects.length;
    };

    add("<< /Type /Catalog /Pages 2 0 R >>");
    const kids = pages.map((_, i) => `${3 + i * 2} 0 R`).join(" ");
    add(`<< /Type /Pages /Count ${pages.length} /Kids [${kids}] >>`);

    pages.forEach((pageLines, pageIndex) => {
        const contentId = 4 + pageIndex * 2;
        add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${2 + pages.length * 2 + 1} 0 R >> >> >>`);
        const stream = pageLines
            .map((line, lineIndex) => {
                const y = PAGE_HEIGHT - 40 - lineIndex * 12;
                return `BT /F1 9 Tf 36 ${y} Td (${escapePdf(line)}) Tj ET`;
            })
            .join("\n");
        add(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`);
    });

    const fontId = add("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>");
    void fontId;

    const xrefOffsets: number[] = [0];
    let body = "%PDF-1.4\n";
    objects.forEach((obj, i) => {
        xrefOffsets.push(Buffer.byteLength(body, "utf8"));
        body += `${i + 1} 0 obj\n${obj}\nendobj\n`;
    });

    const xrefStart = Buffer.byteLength(body, "utf8");
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    xrefOffsets.slice(1).forEach((offset) => {
        xref += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });
    body += xref;
    body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    return Promise.resolve(Buffer.from(body, "utf8"));
}
