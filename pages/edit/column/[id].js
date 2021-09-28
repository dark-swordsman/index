import Head from 'next/head'
import { getCollections } from '../../../lib/db/collections'
import Link from 'next/link'
import { getColumn, getColumns } from '../../../lib/db/columns'
import EditColumn from '../../../components/edit/EditColumn'
import CollectionBoard from '../../../components/boards/CollectionBoard'
import ViewAllButton from '../../../components/buttons/ViewAllButton'

export default function EditorColumn({ _id, collections, columns, column }) {
  let collectionsWithColumn = []
  if (_id !== '_new') {
    collectionsWithColumn = collections.filter((t) =>
      t.columns.some((c) => c === column._id)
    )
  }
  return (
    <>
      <Head>
        <title>
          {(_id === '_new' ? 'Create column' : 'Edit column ' + column.name) +
            ' | ' +
            process.env.NEXT_PUBLIC_SITE_NAME}
        </title>
      </Head>

      <h2>
        {_id === '_new' ? (
          'Create a new column'
        ) : (
          <>
            Edit column{' '}
            <Link href={'/column/' + column.urlId}>{column.name}</Link>
          </>
        )}
        <span className={'float-end'}>
          <ViewAllButton type={'columns'} />
        </span>
      </h2>
      {_id !== '_new' ? (
        <small className={'text-muted'}>
          ID: <code>{column._id}</code>
        </small>
      ) : (
        <></>
      )}

      <div className={'card bg-2 mb-3'}>
        <div className='card-body'>
          {_id === '_new' ? (
            <EditColumn columns={columns} />
          ) : (
            <EditColumn
              columns={columns}
              _id={column._id}
              urlId={column.urlId}
              name={column.name}
              nsfw={column.nsfw}
              description={column.description}
              type={column.type}
              values={column.values}
            />
          )}
        </div>
      </div>

      <h4>Collections with this column</h4>
      {_id !== '_new' ? (
        <CollectionBoard
          _id={column._id}
          collections={collectionsWithColumn}
          allCollections={collections}
          canMove={false}
          canEdit={true}
          updateURL={'/api/edit/column/collections'}
          forceEditMode={true}
        />
      ) : (
        <div className={'text-muted'}>
          Collection selection will be available once the column has been
          created
        </div>
      )}
    </>
  )
}

EditorColumn.auth = {
  requireEditor: true,
}

export async function getServerSideProps({ params }) {
  let column = {}
  if (params.id !== '_new') {
    column = await getColumn(params.id)
    if (!column) {
      return {
        notFound: true,
      }
    }
  }

  return {
    props: {
      _id: params.id,
      collections: await getCollections(),
      columns: await getColumns(),
      column,
    },
  }
}
