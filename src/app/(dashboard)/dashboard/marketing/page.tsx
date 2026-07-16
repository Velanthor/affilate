"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Copy, Image as ImageIcon, Video, Mail, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Asset {
  id: string;
  title: string;
  type: string;
  file_url: string | null;
  content: string | null;
  dimensions: string | null;
}

const typeLabels: Record<string, string> = {
  banner: "Banner",
  logo: "Logos",
  screenshot: "Screenshots",
  social: "Social Media",
  video: "Videos",
  text: "Texte",
  email_template: "E-Mail-Vorlagen",
};

const typeIcons: Record<string, any> = {
  banner: ImageIcon,
  logo: ImageIcon,
  screenshot: ImageIcon,
  social: ImageIcon,
  video: Video,
  text: FileText,
  email_template: Mail,
};

export default function MarketingPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    fetch("/api/affiliate/marketing")
      .then((res) => res.json())
      .then((data) => setAssets(data.assets ?? []))
      .finally(() => setLoading(false));
  }, []);

  const tabs = useMemo(() => {
    const types = Array.from(new Set(assets.map((a) => a.type)));
    return ["all", ...types];
  }, [assets]);

  const filteredAssets = activeTab === "all" ? assets : assets.filter((a) => a.type === activeTab);

  const handleCopyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Text kopiert!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Marketingmaterial</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Banner, Logos, Social-Media-Vorlagen und Texte für deine Kampagnen.
        </p>
      </div>

      <div className="glass rounded-xl p-1 flex flex-wrap gap-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
              activeTab === tab ? "bg-primary-500 text-white" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
            )}
          >
            {tab === "all" ? "Alle" : typeLabels[tab] ?? tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => {
            const Icon = typeIcons[asset.type] ?? FileText;
            const isTextual = asset.type === "text" || asset.type === "email_template";

            return (
              <Card key={asset.id} className="flex flex-col">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 border border-white/[0.08] flex items-center justify-center mb-3">
                  <Icon className="h-4 w-4 text-primary-300" />
                </div>
                <h3 className="font-medium text-foreground text-sm mb-1">{asset.title}</h3>
                {asset.dimensions && <p className="text-xs text-muted-foreground mb-3">{asset.dimensions}</p>}

                {isTextual && asset.content && (
                  <p className="text-xs text-muted-foreground bg-white/[0.03] rounded-lg p-3 mb-3 line-clamp-4 whitespace-pre-line flex-1">
                    {asset.content}
                  </p>
                )}

                <div className="mt-auto pt-2">
                  {isTextual ? (
                    <Button size="sm" variant="secondary" className="w-full" onClick={() => handleCopyText(asset.content ?? "")}>
                      <Copy className="h-3.5 w-3.5" /> Text kopieren
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" className="w-full" asChild>
                      <a href={asset.file_url ?? "#"} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-3.5 w-3.5" /> Herunterladen
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && filteredAssets.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">Keine Materialien in dieser Kategorie.</p>
      )}
    </div>
  );
}
