import type { TableNamesInDataModel } from "convex/server";
import type { GenericId } from "convex/values";

export type Id<TableName extends string> = GenericId<TableName>;

export type Doc<T extends string> = any;

export type TableNames = any;
