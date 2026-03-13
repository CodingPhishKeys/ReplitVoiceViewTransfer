import { Sidebar } from "@/components/Sidebar";
import { useTelephonyByPlatform } from "@/hooks/use-voiceview";
import { useRoute, Link } from "wouter";
import { Phone, MapPin, Building2, ArrowLeft, Hash, Server, GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function TelephonyPlatform() {
  const [, params] = useRoute("/telephony/:platform");
  const platform = params ? decodeURIComponent(params.platform) : "";
  const { data, isLoading } = useTelephonyByPlatform(platform);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto pb-20">

          {/* Header */}
          <header className="mb-8 border-b border-border pb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <Phone className="h-4 w-4" />
              <span className="text-sm font-medium uppercase tracking-wide">Telephony Systems</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">{platform}</h1>
            <p className="text-muted-foreground">
              All sites configured with {platform}
            </p>
          </header>

          {/* Summary Badge */}
          {!isLoading && data && (
            <div className="mb-6">
              <Badge variant="outline" className="text-sm px-3 py-1">
                {data.length} {data.length === 1 ? "site" : "sites"} using {platform}
              </Badge>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
            </div>
          ) : !data || data.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
              <Phone className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Sites Found</h3>
              <p className="text-muted-foreground">
                No sites are currently configured with {platform}.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((record) => (
                <Card key={record.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  {/* Site name bar */}
                  <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
                    <Link
                      href={`/sites/${record.site.id}`}
                      className="flex items-center gap-2 font-semibold text-lg hover:text-blue-300 transition-colors"
                    >
                      <Building2 className="h-4 w-4 text-slate-400" />
                      {record.site.name}
                    </Link>
                    <div className="flex items-center gap-3 text-slate-400 text-sm">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {record.site.region}
                      </span>
                      {record.site.code && (
                        <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{record.site.code}</span>
                      )}
                    </div>
                  </div>

                  <CardContent className="pt-5 pb-5">
                    {/* Details row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                      <div className="bg-muted/40 rounded-lg p-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Voice Service Provider</p>
                        <p className="text-sm font-medium">
                          {record.voiceServiceProvider || <span className="text-muted-foreground italic">Not specified</span>}
                        </p>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Type of Routing</p>
                        <p className="text-sm font-medium">
                          {record.typeOfRouting || <span className="text-muted-foreground italic">Not specified</span>}
                        </p>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Block Size</p>
                        <p className="text-sm font-medium">
                          {record.blockSize || <span className="text-muted-foreground italic">Not specified</span>}
                        </p>
                      </div>
                    </div>

                    {/* Number Ranges */}
                    {record.numberRanges.length > 0 ? (
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Number Ranges</h4>
                        <div className="border border-border rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-muted/50 border-b border-border">
                                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground w-10">#</th>
                                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Range</th>
                              </tr>
                            </thead>
                            <tbody>
                              {record.numberRanges.map((range, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                                  <td className="px-4 py-2 text-muted-foreground text-xs font-mono">{idx + 1}</td>
                                  <td className="px-4 py-2 font-mono text-sm">{range}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No number ranges configured.</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
