import type {
  MMIExhibitor,
  MMIExhibitorResponse,
  MMICategory,
  MMICategoryResponse,
} from "./types";
const MMI_GRAPHQL_URL = "https://mmiconnect.in/graphql";

const EXHIBITOR_QUERY = `
  query getExhibitorListForGroup(
    $where: [WhereExpression!],
    $first: Int,
    $after: Int,
    $categoryIds: [Int],
    $keyword: String,
    $group: String,
    $categoryGroup: String,
    $categoryWhere: [WhereExpression!]
  ) {
    catalogueQueries {
      exhibitorsWithWishListGroup(
        first: $first
        where: $where
        after: $after
        categoryIds: $categoryIds
        keyword: $keyword
        group: $group
      ) {
        totalCount
        exhibitors {
          customer {
            id
            companyName
            country
            squareLogo
            userId
            showId
            exhibitorDetail {
              exhibitorType
              sponsorship
              boothNo
              hallNo
            }
            show {
              showName
              startDate
              endDate
            }
          }
        }
      }
      selectedCustomerCategories(
        where: $categoryWhere
        group: $categoryGroup
      ) {
        categoryType
        productCategoryType
        mainCategory
        categoryName
        id
      }
    }
  }
`;

export async function fetchExhibitorPage(
  first = 100,
  after = -1
) {
  const response = await fetch(MMI_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      operationName: "getExhibitorListForGroup",
      variables: {
        where: [],
        categoryWhere: [
          {
            comparison: "equal",
            path: "categoryType",
            value: ["EXHIBITOR"],
          },
        ],
        group: "ep-blr-2026",
        categoryGroup: "ep-blr-2026",
        first,
        after,
      },
      query: EXHIBITOR_QUERY,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `MMI API error: ${response.status} ${response.statusText}`
    );
  }

  const result: unknown = await response.json();

  return result;
}
interface MMIResponse {
  data?: {
    catalogueQueries?: {
      exhibitorsWithWishListGroup?: {
        totalCount: number;
        exhibitors: unknown[];
      };
    };
  };
}

export async function fetchAllExhibitors(): Promise<MMIExhibitor[]> {
  const pageSize = 100;
  let after = -1;
  let totalCount = 0;

  const allExhibitors: MMIExhibitor[] = [];

  while (true) {
    const response = (await fetchExhibitorPage(
      pageSize,
      after
    )) as MMIExhibitorResponse;

    const result =
      response.data?.catalogueQueries?.exhibitorsWithWishListGroup;

    if (!result) {
      throw new Error("Invalid MMI exhibitor response");
    }

    totalCount = result.totalCount;

    const exhibitors = result.exhibitors ?? [];

    if (exhibitors.length === 0) {
      break;
    }

    allExhibitors.push(...exhibitors);

    console.log(
      `Fetched ${allExhibitors.length} / ${totalCount} exhibitors`
    );

    if (
      allExhibitors.length >= totalCount ||
      exhibitors.length < pageSize
    ) {
      break;
    }

    after += pageSize;
  }

  return allExhibitors;
}
export async function fetchAllCategories(): Promise<MMICategory[]> {
  const response = (await fetchExhibitorPage(
    100,
    -1
  )) as MMICategoryResponse;

  const categories =
    response.data?.catalogueQueries?.selectedCustomerCategories;

  if (!categories) {
    throw new Error("MMI category data not found");
  }

  return categories;
}