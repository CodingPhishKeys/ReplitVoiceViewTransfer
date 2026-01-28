import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPin, Hash, Info } from "lucide-react";
import type { Site } from "@shared/schema";

export function SiteOverview({ site }: { site: Site }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Main Info Card */}
      <Card className="col-span-2 border-l-4 border-l-primary shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            General Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {site.description || "No description available for this site."}
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Region</p>
                <p className="font-semibold text-foreground">{site.region}</p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-md">
                <Hash className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Site Code</p>
                <p className="font-semibold text-foreground">{site.code || "N/A"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats / Status Placeholder */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ActivityIcon />
            System Status
          </CardTitle>
          <CardDescription>Real-time availability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm font-medium">Network</span>
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Online</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm font-medium">Telephony</span>
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Online</Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium">Services</span>
            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Warning</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityIcon() {
  return (
    <svg
      className=" h-5 w-5 text-green-500"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
