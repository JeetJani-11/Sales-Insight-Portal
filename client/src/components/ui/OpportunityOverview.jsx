import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import {
  CalendarIcon,
  DollarSign,
  Building2,
  Users,
  Globe,
} from "lucide-react";

function OpportunityOverview({ opportunity, overview }) {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">{opportunity.NAME}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${opportunity.AMOUNT.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Stage: {opportunity.STAGE_NAME}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Close Date</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(opportunity.CLOSE_DATE).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industry</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{opportunity.INDUSTRY}</div>
            <p className="text-xs text-muted-foreground">
              Revenue: ${opportunity.ANNUAL_REVENUE.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {opportunity.NUMBER_OF_EMPLOYEES.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Locations: {opportunity.NUMBEROF_LOCATIONS_C}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center">
            <Globe className="mr-2 h-5 w-5" />
            Company Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{opportunity.DESCRIPTION}</p>
        </CardContent>
      </Card>

      {Object.entries(overview).map(([section, data]) => (
        <Card key={section} className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{section}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data).map(([key, value]) => (
                <div key={key}>
                  <Badge variant="secondary">{key}</Badge>
                  <p className="mt-1 text-sm">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

OpportunityOverview.propTypes = {
  opportunity: PropTypes.shape({
    NAME: PropTypes.string.isRequired,
    AMOUNT: PropTypes.number.isRequired,
    CLOSE_DATE: PropTypes.string.isRequired,
    STAGE_NAME: PropTypes.string.isRequired,
    INDUSTRY: PropTypes.string.isRequired,
    ANNUAL_REVENUE: PropTypes.number.isRequired,
    NUMBER_OF_EMPLOYEES: PropTypes.number.isRequired,
    NUMBEROF_LOCATIONS_C: PropTypes.number.isRequired,
    DESCRIPTION: PropTypes.string.isRequired,
  }).isRequired,
  overview: PropTypes.shape({
    Challenges: PropTypes.object.isRequired,
    Strategies: PropTypes.object.isRequired,
    Relationship: PropTypes.object.isRequired,
    Outcome: PropTypes.object.isRequired,
    Insights: PropTypes.object.isRequired,
  }).isRequired,
};

export default OpportunityOverview;
