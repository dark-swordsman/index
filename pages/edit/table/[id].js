import Layout, {siteName} from "../../../components/layout/Layout"
import Head from "next/head"
import {getTabsWithTables} from "../../../lib/db/tabs"
import {useSession} from "next-auth/client"
import Login from "../../../components/layout/Login"
import {getTables} from "../../../lib/db/tables"
import Link from "next/link"
import {getColumns} from "../../../lib/db/columns"
import EditTable from "../../../components/edit/EditTable"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import ColumnBoard from "../../../components/boards/ColumnBoard"
import {canEdit} from "../../../lib/session"
import NotAdmin from "../../../components/layout/NotAdmin"
import TabBoard from "../../../components/boards/TabBoard"

export default function EditorTable({urlId, tabs, tables, columns}) {
    const [session] = useSession()

    if (!session) {
        return <Layout tabs={tabs}>
            <Login/>
        </Layout>
    }

    if (!canEdit(session)) {
        return <Layout tabs={tabs}>
            <NotAdmin/>
        </Layout>
    }

    let table = [], tabsWithTable = []
    if (urlId !== "_new") {
        table = tables.find(t => t.urlId === urlId)
        table.columns = table.columns.map(c => columns.find(t => t._id === c))
        tabsWithTable = tabs.filter(t => t.tables.some(c => c._id === table._id))
    }

    return <Layout tabs={tabs}>
        <Head>
            <title>
                {(typeof table === "undefined" ? "Create table" : "Edit table " + table.name) + " | " + siteName}
            </title>
        </Head>

        <div className={"card bg-2 mb-3"}>
            <div className="card-body">
                <div className={"card-title"}>
                    <h2>
                        {typeof table === "undefined" ? "Create a new table" : <>
                            Edit table <Link href={"/table/" + table.urlId}>{table.name}</Link>
                        </>}
                        <span className={"float-end"}>
                            <Link href={"/tables"}>
                                <a className={"btn btn-outline-secondary"}>
                                    Table manager
                                    <FontAwesomeIcon icon={["fas", "arrow-alt-circle-right"]} className={"ms-2"}/>
                                </a>
                            </Link>
                        </span>
                    </h2>
                    {typeof table !== "undefined" ?
                        <small className={"text-muted"}>
                            ID: <code>{table._id}</code>
                        </small> : <></>}
                </div>
                {typeof table === "undefined" ? <EditTable tables={tables} columnsDatalist={columns}/> :
                    <>
                        <EditTable tables={tables} columnsDatalist={columns} _id={table._id} urlId={table.urlId}
                                   name={table.name} nsfw={table.nsfw} description={table.description}
                                   columns={table.columns}/>
                    </>
                }
            </div>
        </div>

        <h4>
            Tabs with this table
        </h4>
        {typeof table !== "undefined" ?
            <TabBoard _id={table._id} tabs={tabsWithTable} allTabs={tabs} canMove={false}
                      updateURL={"/api/edit/table/tabs"} deleteURL={""} forceEditMode={true}/> :
            <div className={"text-muted"}>
                Tab selection will be available once the table has been created
            </div>
        }

        <h4>
            Columns used in this table
        </h4>
        {typeof table !== "undefined" ?
            <ColumnBoard _id={table._id} columns={table.columns} allColumns={columns} canMove={false}
                         forceEditMode={true}/> :
            <div className={"text-muted"}>
                Column selection will be available once the table has been created
            </div>
        }
    </Layout>
}

export async function getServerSideProps({params}) {
    return {
        props: {
            urlId: params.id,
            tabs: await getTabsWithTables(),
            tables: await getTables(),
            columns: await getColumns()
        }
    }
}
